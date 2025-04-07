import json
import time
import os
import random
from src.api_client import make_coingecko_request
from src.config import CRYPTO_CACHE_TIME, GENERATE_MOCK_DATA

CACHE_FILE = "data/crypto_cache.json"

os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)


def get_cached_crypto():
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                cache = json.load(f)

            if time.time() - cache["timestamp"] < CRYPTO_CACHE_TIME:
                 print(f"Using crypto cache. Time until refresh: {CRYPTO_CACHE_TIME - (time.time() - cache['timestamp']):.0f} sec.")
                 return cache["data"]
            else:
                 print("Crypto cache expired.")
        else:
            print("Crypto cache file not found.")
    except Exception as e:
        print(f"Ошибка при чтении кэша криптовалют: {e}")

    return None


def cache_crypto(crypto_data):
    try:
        cache = {
            "timestamp": time.time(),
            "data": crypto_data,
        }

        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        print(f"Crypto data cached successfully: {len(crypto_data)} items.")
    except Exception as e:
        print(f"Ошибка при сохранении кэша криптовалют: {e}")


def generate_mock_sparkline(base_price, num_points=168):
    points = []
    if not base_price or base_price <= 0:
         base_price = random.uniform(1, 1000) 

    volatility = base_price * 0.05

    prev_price = base_price
    for _ in range(num_points):
        change = random.uniform(-volatility, volatility)
        new_price = max(0.000001, prev_price + change) 
        if abs(new_price - base_price) > base_price * 0.3: 
            new_price = max(0.000001, prev_price - change)

        points.append(new_price)
        prev_price = new_price

    return points

def _generate_mock_crypto_data(limit=50):
    print("Generating MOCK crypto data...")
    mock_data = {}
    base_coins = [
        {"id": "bitcoin", "name": "Bitcoin", "symbol": "BTC", "price": 65000, "market_cap": 1300000000000},
        {"id": "ethereum", "name": "Ethereum", "symbol": "ETH", "price": 3500, "market_cap": 420000000000},
        {"id": "tether", "name": "Tether", "symbol": "USDT", "price": 1, "market_cap": 110000000000},
        {"id": "binancecoin", "name": "BNB", "symbol": "BNB", "price": 600, "market_cap": 90000000000},
        {"id": "solana", "name": "Solana", "symbol": "SOL", "price": 150, "market_cap": 70000000000},
        {"id": "usd-coin", "name": "USD Coin", "symbol": "USDC", "price": 1, "market_cap": 35000000000},
        {"id": "xrp", "name": "XRP", "symbol": "XRP", "price": 0.5, "market_cap": 28000000000},
        {"id": "dogecoin", "name": "Dogecoin", "symbol": "DOGE", "price": 0.15, "market_cap": 22000000000},
        {"id": "toncoin", "name": "Toncoin", "symbol": "TON", "price": 7.5, "market_cap": 18000000000},
        {"id": "cardano", "name": "Cardano", "symbol": "ADA", "price": 0.45, "market_cap": 16000000000},
    ]

    for i in range(limit):
        if i < len(base_coins):
            coin_base = base_coins[i]
            coin_id = coin_base["id"]
        else:
            coin_id = f"mockcoin-{i+1}"
            coin_base = {
                "id": coin_id,
                "name": f"Mock Coin {i+1}",
                "symbol": f"MC{i+1}",
                "price": random.uniform(0.01, 1000),
                "market_cap": random.uniform(1000000, 10000000000)
            }

        mock_data[coin_id] = {
            "id": coin_id,
            "name": coin_base["name"],
            "symbol": coin_base["symbol"].upper(),
            "current_price": coin_base["price"] * random.uniform(0.95, 1.05), # Slight variation
            "image": f"https://via.placeholder.com/32/007bff/ffffff?text={coin_base['symbol'][0]}", # Placeholder image
            "market_cap": coin_base["market_cap"] * random.uniform(0.9, 1.1),
            "price_change_24h": random.uniform(-10, 10),
            "sparkline_data": generate_mock_sparkline(coin_base["price"]),
        }
    return mock_data


def fetch_crypto_data(limit=250):
    if GENERATE_MOCK_DATA:
        cached_crypto = get_cached_crypto()
        if cached_crypto:
             return cached_crypto
        else:
             mock_data = _generate_mock_crypto_data(limit=limit)
             cache_crypto(mock_data)
             return mock_data

    cached_crypto = get_cached_crypto()
    if cached_crypto:
        return cached_crypto

    try:
        processed_data = {}
        page = 1
        per_page = min(limit, 250) # CoinGecko max per_page is 250
        fetched_count = 0

        while fetched_count < limit:
            current_limit = min(per_page, limit - fetched_count)
            if current_limit <= 0: break

            print(f"Fetching page {page}, per_page={current_limit} (total limit {limit})")
            data = make_coingecko_request(
                "coins/markets",
                vs_currency="usd",
                order="market_cap_desc",
                per_page=current_limit,
                page=page,
                sparkline="true",
                price_change_percentage="24h",
            )

            if data is None:
                print("CoinGecko API returned None, stopping fetch.")
                break

            if not isinstance(data, list):
                 print(f"CoinGecko API returned non-list data: {type(data)}. Stopping fetch.")
                 break

            if not data:
                print("CoinGecko API returned empty list, assuming end of data.")
                break

            for coin in data:
                if not isinstance(coin, dict) or 'id' not in coin:
                     print(f"Skipping invalid coin data item: {coin}")
                     continue

                coin_id = coin["id"]
                sparkline_prices = coin.get("sparkline_in_7d", {}).get("price", [])

                if not all(k in coin for k in ['name', 'symbol', 'current_price', 'image', 'market_cap', 'price_change_percentage_24h']):
                     print(f"Skipping coin '{coin_id}' due to missing essential data.")
                     continue

                processed_data[coin_id] = {
                    "id": coin_id,
                    "name": coin["name"],
                    "symbol": coin["symbol"].upper(),
                    "current_price": coin.get("current_price"), 
                    "image": coin.get("image"),
                    "market_cap": coin.get("market_cap"),
                    "price_change_24h": coin.get("price_change_percentage_24h"),
                    "sparkline_data": sparkline_prices if sparkline_prices else [], 
                }
                fetched_count += 1
                if fetched_count >= limit:
                    break

            page += 1
            if page > (limit // per_page) + 5:
                 print("Reached safety page limit, stopping fetch.")
                 break


        if not processed_data:
            print("Failed to fetch any valid data from CoinGecko API.")

            return {}

        print(f"Successfully fetched {len(processed_data)} crypto data items.")
        cache_crypto(processed_data)
        return processed_data

    except Exception as e:
        print(f"General error during fetching crypto data: {e}")
        import traceback
        traceback.print_exc()
        return {} 