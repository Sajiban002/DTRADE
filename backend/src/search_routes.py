from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
import yfinance as yf
from src.crypto_service import fetch_crypto_data
import traceback
import logging
import requests

router = APIRouter(prefix="/api", tags=["search"])
logger = logging.getLogger(__name__)

@router.get("/crypto/search")
def search_crypto(query: str = Query(..., min_length=2)):
    crypto_data = fetch_crypto_data()
    if not crypto_data:
        logger.warning("Crypto data not available for search.")
        return []

    query_lower = query.lower()
    results = []

    for coin_id, coin_data in crypto_data.items():
        name_lower = coin_data.get("name", "").lower()
        symbol_lower = coin_data.get("symbol", "").lower()

        if query_lower in name_lower or query_lower in symbol_lower:
            if all(k in coin_data for k in ("name", "symbol", "current_price")):
                 results.append({
                    "id": coin_id,
                    "name": coin_data["name"],
                    "symbol": coin_data["symbol"],
                    "image": coin_data.get("image"),
                    "current_price": coin_data["current_price"],
                    "type": "crypto"
                 })
            else:
                 logger.warning(f"Skipping incomplete crypto data for ID: {coin_id}")

    return results[:10]


@router.get("/stocks/search")
def search_stocks(query: str = Query(..., min_length=2)):
    results = []
    processed_symbols = set()
    query_upper = query.upper()
    query_lower = query.lower()
    logger.info(f"--- Searching stocks for query: {query} (Upper: {query_upper}) ---")

    try:
        logger.info(f"Attempting direct ticker lookup for: {query_upper}")
        ticker = yf.Ticker(query_upper)
        info = ticker.info

        if info and info.get('symbol'):
            symbol = info['symbol']
            quote_type = info.get('quoteType')
            logger.info(f"Found ticker info for {symbol}, QuoteType: {quote_type}")

            if quote_type in ['EQUITY', 'ETF', 'CURRENCY', 'INDEX'] and (info.get('regularMarketPrice') is not None or info.get('currentPrice') is not None):
                 if symbol not in processed_symbols:
                    type_mapping = {
                        "EQUITY": "stock", "ETF": "etf", "CURRENCY": "currency",
                        "INDEX": "index", "MUTUALFUND": "fund",
                    }
                    simple_type = type_mapping.get(quote_type, "stock")

                    results.append({
                        "id": symbol,
                        "name": info.get("longName", info.get("shortName", symbol)),
                        "symbol": symbol,
                        "current_price": info.get("regularMarketPrice", info.get("currentPrice", 0)),
                        "type": simple_type,
                        "image": None
                    })
                    processed_symbols.add(symbol)
                    logger.info(f"Added {symbol} ({simple_type}) from direct lookup.")
            elif quote_type:
                 logger.warning(f"Ticker {symbol} found, but QuoteType '{quote_type}' or price is missing/invalid.")
            else:
                 logger.warning(f"Ticker info found for {symbol}, but QuoteType is missing.")
        else:
             logger.warning(f"No valid ticker info found via direct ticker lookup for {query_upper}.")
             fuzzy_results = fuzzy_search_yahoo(query)
             if fuzzy_results:
                 return fuzzy_results
             else:
                return [] 
    except Exception as e:
        logger.error(f"Direct Ticker lookup failed for '{query_upper}'. Error: {e}", exc_info=True)
        return [] 

    if not results or ("=" in query_upper or query_lower in ["eur", "usd", "gbp", "jpy", "chf", "cad", "btc", "eth"]):
        logger.info("Attempting fallback currency/crypto pair search...")
        currency_pairs = ["EURUSD=X", "USDJPY=X", "GBPUSD=X", "USDCHF=X", "AUDUSD=X", "USDCAD=X", "BTC-USD", "ETH-USD",
                         "RUB=X", "UAH=X", "BYN=X", "KZT=X"] #

        for pair in currency_pairs:
             should_check = pair not in processed_symbols and (query_lower in pair.lower() or query_lower == pair.split('=')[0].lower() or query_lower == pair.split('-')[0].lower())
             if should_check:
                 logger.info(f"Checking currency pair: {pair}")
                 try:
                    ticker = yf.Ticker(pair)
                    info = ticker.info
                    if info and info.get('symbol') and info.get('regularMarketPrice') is not None:
                         symbol = info['symbol']
                         if symbol not in processed_symbols:
                             results.append({
                                "id": symbol,
                                "name": info.get("shortName", symbol),
                                "symbol": symbol,
                                "current_price": info.get("regularMarketPrice", 0),
                                "type": "currency",
                                "image": None
                             })
                             processed_symbols.add(symbol)
                             logger.info(f"Added {symbol} (currency) from fallback lookup.")
                             if len(results) >= 10: break
                 except Exception as e:
                     logger.error(f"Currency pair lookup failed for '{pair}'. Error: {e}", exc_info=True)
                     continue

    logger.info(f"--- Search for '{query}' completed. Found {len(results)} results: {results} ---")
    return results[:10]


def fuzzy_search_yahoo(query: str) -> List[Dict[str, Any]]:
    """Performs a fuzzy search against Yahoo Finance to find stocks."""
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={query}&newsCount=0"
        response = requests.get(url)
        response.raise_for_status()  

        data = response.json()
        results = []
        if data and "quotes" in data:
            for item in data["quotes"]:
                if item.get("quoteType") in ["EQUITY", "ETF", "INDEX", "CURRENCY"]:
                    results.append({
                        "id": item["symbol"],
                        "name": item["longname"] if "longname" in item else item["shortname"],
                        "symbol": item["symbol"],
                        "current_price": item.get("regularMarketPrice", 0),
                        "type": item["quoteType"].lower(),
                        "image": None  
                    })
        return results
    except requests.exceptions.RequestException as e:
        logger.error(f"Fuzzy search failed for '{query}'. Error: {e}", exc_info=True)
        return []