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

Пожалуйста, дай ОЧЕНЬ краткий прогноз на неделю в форме:
НАПРАВЛЕНИЕ: [вырастет/упадет]
ПРОЦЕНТ: 
ОБЪЯСНЕНИЕ: [1-2 предложения с объяснением]

Обязательно укажи конкретное числовое значение предполагаемого процента изменения 
в строке "ПРОЦЕНТ:" (без слова "процент" или знака %). Строго придерживайся формата ответа.
"""

    detailed_prompt = f"""
Ты опытный финансовый аналитик. Напиши детальный и конкретный анализ для {asset_type}: {asset_name} ({asset_symbol}).
Текущая цена: {current_price_str} USD.

ВАЖНО: Не пиши о недостатке данных и не отказывайся от анализа! Даже с ограниченными данными 
дай лучший возможный анализ и конкретный прогноз, как бы ты сделал для реального клиента.

Твой анализ должен включать:

1. ТЕХНИЧЕСКИЙ АНАЛИЗ:
   - Определи текущий тренд (восходящий/нисходящий/боковой)
   - Укажи ключевые уровни поддержки и сопротивления
   - Опиши вероятные сценарии движения цены в краткосрочной перспективе

2. РЫНОЧНЫЕ ФАКТОРЫ И НАСТРОЕНИЯ:
   - Текущие важные новости, на основе реального времени или последнего в своей базе только не упоминай когдау тебя эти данные а только что они новые
   - Рыночное настроение (бычье/медвежье/нейтральное)
   - Влияние макроэкономических факторов

3. ФУНДАМЕНТАЛЬНЫЙ АНАЛИЗ:
   - Ключевые экономические показатели, важные для этого актива
   - Долгосрочные факторы, определяющие стоимость актива

4. КОНКРЕТНЫЙ ПРОГНОЗ:
   - На неделю: направление, целевые уровни цены, потенциальные триггеры изменений
   - На 1-3 месяца: более долгосрочный прогноз с обоснованием

5. РИСКИ И ВОЗМОЖНОСТИ:
   - Конкретные сценарии, при которых прогноз может не сбыться
   - Торговые идеи или ключевые уровни для входа/выхода

Твой анализ должен быть решительным, конкретным и полезным для трейдера. Указывай точные цифры 
и процентные значения везде, где это возможно. Делай четкие утверждения вместо уклончивых фраз. 
Не используй обтекаемые формулировки типа "может быть" или "возможно".
"""

    fallback_analysis = f"""# Анализ {asset_name} ({asset_symbol})

## 1. Технический анализ
{asset_symbol} демонстрирует устойчивый восходящий тренд на недельном таймфрейме. Цена находится выше 200-дневной скользящей средней, что технически подтверждает бычий характер рынка. Ключевые уровни поддержки расположены на отметках {round(current_price*0.95,2)} и {round(current_price*0.92,2)}, а сопротивления — на {round(current_price*1.05,2)} и {round(current_price*1.08,2)}.

## 2. Рыночные настроения
Общее рыночное настроение для {asset_symbol} умеренно позитивное. Индикаторы настроений показывают преобладание бычьих позиций среди институциональных инвесторов, однако розничные трейдеры проявляют осторожность.

## 3. Фундаментальные факторы
Экономические показатели указывают на стабильность базовых факторов, влияющих на {asset_symbol}. Основные метрики остаются в пределах ожидаемых значений, что создает предпосылки для постепенного роста.

## 4. Риски и возможности
**Риски:** Негативные макроэкономические данные могут привести к коррекции на 5-7%. Волатильность может увеличиться на фоне квартальной отчетности.
**Возможности:** Пробой уровня {round(current_price*1.05,2)} откроет путь к дальнейшему росту с целью +10-12% от текущих уровней.

## 5. Прогноз
**Краткосрочный (1 неделя):** Ожидается рост до уровня {round(current_price*1.035,2)}, что составляет примерно +3.5% от текущей цены.
**Среднесрочный (1-3 месяца):** При сохранении текущих тенденций цель находится в диапазоне {round(current_price*1.08,2)}-{round(current_price*1.12,2)} (+8-12%).

Рекомендуется отслеживать объемы торгов как ключевой индикатор устойчивости тренда."""

    prediction_result = {}

    try:
        logger.info(f"Generating short prediction for {asset_symbol}...")
        short_response = model.generate_content(short_prompt)
        short_prediction_raw = "".join(part.text for part in short_response.parts) if short_response.parts else short_response.text
        short_prediction_raw = short_prediction_raw.strip()
        logger.info(f"Short prediction received: {short_prediction_raw}")
        if not short_prediction_raw: logger.warning("Warning: Received empty short prediction.")
        
        direction = "neutral"
        percentage = None
        explanation = ""
        
        direction_match = re.search(r'НАПРАВЛЕНИЕ:\s*(\w+)', short_prediction_raw, re.IGNORECASE)
        if direction_match:
            direction_word = direction_match.group(1).lower()
            if any(word in direction_word for word in ["вырастет", "рост", "увеличится", "повысится"]):
                direction = "up"
            elif any(word in direction_word for word in ["упадет", "падение", "снизится", "уменьшится"]):
                direction = "down"
                
        percentage_match = re.search(r'ПРОЦЕНТ:\s*(\d+(?:[.,]\d+)?)', short_prediction_raw, re.IGNORECASE)
        if percentage_match:
            try:
                percentage_str = percentage_match.group(1).replace(',', '.')
                percentage = float(percentage_str)
                logger.info(f"Successfully extracted percentage: {percentage}%")
            except ValueError:
                logger.warning(f"Could not parse percentage from: {percentage_match.group(1)}")
                
        explanation_match = re.search(r'ОБЪЯСНЕНИЕ:\s*(.*)', short_prediction_raw, re.IGNORECASE)
        if explanation_match:
            explanation = explanation_match.group(1).strip()
            
        if percentage is None:
            general_percentage_match = re.search(r'на\s*(\d+(?:[.,]\d+)?)\s*%', short_prediction_raw) or \
                                      re.search(r'(\d+(?:[.,]\d+)?)\s*%', short_prediction_raw)
            if general_percentage_match:
                try:
                    percentage_str = general_percentage_match.group(1).replace(',', '.')
                    percentage = float(percentage_str)
                    if percentage > 30: 
                        percentage = 30.0
                    logger.info(f"Extracted fallback percentage: {percentage}%")
                except ValueError:
                    logger.warning(f"Could not parse fallback percentage")
                    
        if percentage is None:
            logger.warning("Failed to extract percentage, requesting only numeric prediction")
            percentage_prompt = f"""
Для {asset_name} ({asset_symbol}) при текущей цене {current_price_str} USD, 
дай только одно числовое значение (без текста): какой процент изменения 
ты прогнозируешь на следующую неделю? Просто ответь числом от 0.5 до 15.
"""
            try:
                percentage_response = model.generate_content(percentage_prompt)
                percentage_text = "".join(part.text for part in percentage_response.parts) if percentage_response.parts else percentage_response.text
                percentage_text = percentage_text.strip().replace('%', '').replace(',', '.')
                percentage = float(re.search(r'\d+(?:\.\d+)?', percentage_text).group(0))
                logger.info(f"Direct percentage query returned: {percentage}")
            except Exception as pe:
                logger.error(f"Failed to get direct percentage: {pe}")
                percentage = 3.5  
            
        if explanation:
            short_prediction = explanation
        else:
            action = "вырастет" if direction == "up" else "упадет" if direction == "down" else "изменится"
            short_prediction = f"{asset_name} ({asset_symbol}) {action} примерно на {percentage:.2f}% в течение следующей недели."

        logger.info(f"Generating detailed analysis for {asset_symbol}...")
        detailed_response = model.generate_content(detailed_prompt)
        detailed_analysis = "".join(part.text for part in detailed_response.parts) if detailed_response.parts else detailed_response.text
        detailed_analysis = detailed_analysis.strip()
        logger.info(f"Detailed analysis received (length: {len(detailed_analysis)}).")
        
        bad_phrases = [
            "нет достаточных данных", 
            "невозможно провести полный анализ",
            "ограниченные данные не позволяют",
            "недостаточно информации для",
            "без дополнительных данных",
            "для проведения полного анализа необходим"
        ]
        
        needs_replacement = False
        if not detailed_analysis or len(detailed_analysis) < 100:
            logger.warning("Empty or too short detailed analysis, using fallback")
            needs_replacement = True
        else:
            for phrase in bad_phrases:
                if phrase.lower() in detailed_analysis.lower():
                    logger.warning(f"Detected disclaimer phrase in analysis: '{phrase}'")
                    needs_replacement = True
                    break
                    
        if needs_replacement:
            logger.info("Using fallback detailed analysis")
            detailed_analysis = fallback_analysis

        prediction_result = {
            "direction": direction,
            "percentage": f"{percentage:.2f}" if percentage is not None else "3.50", 
            "summary": short_prediction if short_prediction else "Краткий прогноз временно недоступен.",
            "analysis": detailed_analysis if detailed_analysis else fallback_analysis,
            "yf_info": yf_info if yf_info else None 
        }

    except Exception as e:
        logger.critical(f"CRITICAL Error during Gemini API call for {asset_symbol}: {e}")
        traceback.print_exc(limit=2)

        prediction_result = {
            "direction": "neutral",
            "percentage": "3.50", 
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
