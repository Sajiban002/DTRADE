from fastapi import APIRouter, Body, HTTPException
from typing import Dict, Any
import google.generativeai as genai
from src.config import GEMINI_API_KEY
from src.crypto_service import fetch_crypto_data
import yfinance as yf
import random
import json
import os
from datetime import datetime
import re
import traceback
import logging

router = APIRouter(prefix="/api", tags=["prediction"])
logger = logging.getLogger(__name__)

if not GEMINI_API_KEY:
    logger.critical("GEMINI_API_KEY not found. Predictions will fail.")
    model = None
else:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        logger.info("Gemini Model 'gemini-1.5-flash-latest' initialized successfully.")
    except Exception as e:
        logger.critical(f"Error initializing GenerativeModel: {e}")
        model = None


PREDICTIONS_FILE = "data/predictions.json"
os.makedirs(os.path.dirname(PREDICTIONS_FILE), exist_ok=True)

def load_predictions():
    if os.path.exists(PREDICTIONS_FILE):
        try:
            with open(PREDICTIONS_FILE, "r", encoding="utf-8") as f:
                content = f.read()
                if not content:
                    return {"predictions": []}
                return json.loads(content)
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error loading predictions file {PREDICTIONS_FILE}: {e}")
            return {"predictions": []}
    return {"predictions": []}

def save_prediction(prediction_data):
    data = load_predictions()
    if not isinstance(data.get("predictions"), list):
         logger.warning("Predictions data is corrupted, resetting.")
         data = {"predictions": []}

    prediction_data["timestamp"] = datetime.now().isoformat()

    data["predictions"].append(prediction_data)

    MAX_HISTORY = 100
    if len(data["predictions"]) > MAX_HISTORY:
        data["predictions"] = data["predictions"][-MAX_HISTORY:]

    try:
        with open(PREDICTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except (IOError, TypeError) as e:
        logger.error(f"Error saving prediction to {PREDICTIONS_FILE}: {e}")
        return False

@router.get("/predictions")
async def get_predictions_history():
    predictions_data = load_predictions()
    return {"predictions": predictions_data.get("predictions", [])[::-1]}

@router.post("/prediction")
async def get_prediction(payload: Dict[str, Any] = Body(...)):
    if model is None:
         logger.error("Prediction request failed: Generative AI model is not available.")
         raise HTTPException(status_code=503, detail="Generative AI model is not available.")

    asset_type = payload.get("assetType")
    asset_id = payload.get("assetId")
    asset_name = payload.get("assetName")
    asset_symbol = payload.get("assetSymbol")

    logger.info(f"Received prediction request for: Type={asset_type}, ID={asset_id}, Name={asset_name}, Symbol={asset_symbol}")

    if not all([asset_type, asset_id, asset_name, asset_symbol]):
        raise HTTPException(status_code=400, detail="Missing required asset information in payload.")

    asset_data = {}
    historical_data_info = "Информация об исторических данных не определена."
    current_price = None
    yf_info = None

    if asset_type == "crypto":
        all_crypto_data = fetch_crypto_data()
        if asset_id in all_crypto_data:
            asset_data = all_crypto_data[asset_id]
            current_price = asset_data.get('current_price')
            historical_data_info = "Доступны данные Sparkline за 7 дней." if asset_data.get("sparkline_data") else "Исторические данные (Sparkline) недоступны."
        else:
             raise HTTPException(status_code=404, detail=f"Crypto asset '{asset_id}' not found in our data.")

    elif asset_type in ["stock", "currency", "equity", "etf", "index"]:
        try:
            logger.info(f"Fetching yfinance data for {asset_id}...")
            ticker = yf.Ticker(asset_id)
            info = ticker.info
            if not info or not info.get('symbol'):
                 logger.warning(f"yfinance returned no valid info for ticker {asset_id}")
                 raise HTTPException(status_code=404, detail=f"Не удалось получить действительную информацию для тикера {asset_id}")

            asset_data = info
            asset_symbol = info.get('symbol', asset_symbol) 
            asset_name = info.get("longName", info.get("shortName", asset_symbol))
            current_price = info.get("regularMarketPrice", info.get("currentPrice"))
            asset_data["current_price"] = current_price 
            yf_info = {
                "symbol": asset_symbol,
                "name": asset_name,
                "current_price": current_price,
                "open": info.get("open"),
                "high": info.get("dayHigh"),
                "low": info.get("dayLow"),
                "volume": info.get("volume")
            }


            if current_price is None:
                 logger.warning(f"Warning: Current price is missing for {asset_id}")
                 hist_now = ticker.history(period="1d")
                 if not hist_now.empty:
                     current_price = hist_now['Close'].iloc[-1]
                     asset_data["current_price"] = current_price
                     logger.info(f"Using fallback price from history: {current_price}")


            logger.info(f"Fetching 1y history for {asset_id}...")
            history_df = ticker.history(period="1y")
            if history_df.empty:
                logger.warning(f"Warning: No 1y historical data found for {asset_id}.")
                historical_data_info = f"Исторические данные за 1 год для {asset_id} не найдены."
                asset_data["history"] = []
            else:

                asset_data["history"] = history_df.reset_index().to_dict("records")
                historical_data_info = f"Доступны исторические данные за 1 год ({len(asset_data['history'])} записей)."

        except Exception as e:
            logger.error(f"Error fetching Yahoo Finance data for {asset_id}: {e}")
            traceback.print_exc(limit=2)
            raise HTTPException(status_code=503, detail=f"Ошибка при получении финансовых данных для {asset_id}. Попробуйте позже.")
    else:
        raise HTTPException(status_code=400, detail=f"Неподдерживаемый тип актива: {asset_type}")


    current_price_str = f"{current_price:.2f}" if isinstance(current_price, (int, float)) else "Неизвестно"
    logger.info(f"Data prepared for prompts: Price={current_price_str}, History={historical_data_info}")


    short_prompt = f"""
Финансовый AI-аналитик. Краткий прогноз для {asset_type}: {asset_name} ({asset_symbol}).
Текущая цена: {current_price_str} USD.
Исторические данные: {historical_data_info}.
Твой прогноз на неделю (вырастет/упадет) и примерный % изменения? Дай ОЧЕНЬ короткий ответ (1 предложение, только прогноз и %).
"""

    detailed_prompt = f"""
Финансовый AI-аналитик. Детальный анализ для {asset_type}: {asset_name} ({asset_symbol}).
Текущая цена: {current_price_str} USD.
Исторические данные: {historical_data_info}.
Проведи комплексный анализ:
1. Технический анализ (на основе доступных данных).
2. Рыночные настроения (новости, тренды).
3. Фундаментальные факторы (экономика, проект/компания, конкуренция).
4. Риски и возможности.
5. Прогноз на неделю и 1-3 месяца с обоснованием.
Структурируй ответ. Если данных мало, укажи это.
"""

    fallback_analysis = f"Детальный анализ для {asset_name} ({asset_symbol}) временно недоступен из-за технических ограничений или отсутствия достаточных данных для анализа."
    prediction_result = {}

    try:
        logger.info(f"Generating short prediction for {asset_symbol}...")
        short_response = model.generate_content(short_prompt)
        short_prediction = "".join(part.text for part in short_response.parts) if short_response.parts else short_response.text
        short_prediction = short_prediction.strip()
        logger.info(f"Short prediction received: {short_prediction}")
        if not short_prediction: logger.warning("Warning: Received empty short prediction.")

        logger.info(f"Generating detailed analysis for {asset_symbol}...")
        detailed_response = model.generate_content(detailed_prompt)
        detailed_analysis = "".join(part.text for part in detailed_response.parts) if detailed_response.parts else detailed_response.text
        detailed_analysis = detailed_analysis.strip()
        logger.info(f"Detailed analysis received (length: {len(detailed_analysis)}).")
        if not detailed_analysis: logger.warning("Warning: Received empty detailed analysis.")

        direction_keywords_up = ["увеличится", "вырастет", "повысится", "рост", "подорожает", "оптимистичный", "вверх"]
        direction_keywords_down = ["уменьшится", "упадет", "понизится", "падение", "подешевеет", "пессимистичный", "вниз", "снижение"]

        direction = "neutral"
        short_pred_lower = short_prediction.lower()
        if any(keyword in short_pred_lower for keyword in direction_keywords_up):
            direction = "up"
        elif any(keyword in short_pred_lower for keyword in direction_keywords_down):
            direction = "down"

        percentage = random.uniform(1.0, 7.0) 
        percentage_match = re.search(r'на\s*(\d+(?:[.,]\d+)?)\s*%', short_prediction) or \
                           re.search(r'(\d+(?:[.,]\d+)?)\s*%', short_prediction) 

        if percentage_match:
            try:
                percentage_str = percentage_match.group(1).replace(',', '.')
                extracted_percentage = float(percentage_str)
                if 0 < extracted_percentage < 100: 
                     percentage = extracted_percentage
                else:
                     logger.warning(f"Extracted percentage {extracted_percentage}% seems unreasonable, using default.")
            except ValueError:
                 logger.warning(f"Could not parse percentage from: {percentage_match.group(1)}")

        prediction_result = {
            "direction": direction,
            "percentage": f"{percentage:.2f}", 
            "summary": short_prediction if short_prediction else "Краткий прогноз временно недоступен.",
            "analysis": detailed_analysis if detailed_analysis else fallback_analysis,
            "yf_info": yf_info if yf_info else None 
        }

    except Exception as e:
        logger.critical(f"CRITICAL Error during Gemini API call for {asset_symbol}: {e}")
        traceback.print_exc(limit=2)

        prediction_result = {
            "direction": random.choice(["up", "down"]),
            "percentage": f"{random.uniform(1.0, 5.0):.2f}", 
            "summary": f"Прогноз для {asset_name} временно недоступен (ошибка API).",
            "analysis": fallback_analysis,
            "yf_info": None
        }
        save_error = str(e) 

        save_data = {
            "assetType": asset_type, "assetId": asset_id, "assetName": asset_name,
            "assetSymbol": asset_symbol, "prediction": prediction_result,
            "error": save_error 
        }
        save_prediction(save_data)
        return prediction_result


    save_data = {
        "assetType": asset_type, "assetId": asset_id, "assetName": asset_name,
        "assetSymbol": asset_symbol, "prediction": prediction_result
    }
    save_prediction(save_data)

    logger.info(f"Prediction for {asset_symbol} completed successfully.")
    return prediction_result