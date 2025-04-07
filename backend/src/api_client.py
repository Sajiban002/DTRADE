import requests
import time
import random
from src.config import COIN_GECKO_API_KEY

def make_coingecko_request(endpoint, **params):
    base_url = f"https://api.coingecko.com/api/v3/{endpoint}"

    if 'sparkline' in params:
        params['sparkline'] = 'true' if params['sparkline'] else 'false'

    if COIN_GECKO_API_KEY:
        params["x_cg_api_key"] = COIN_GECKO_API_KEY
    max_retries = 3
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            print(f"Запрос к CoinGecko: {base_url}, Параметры: {params}")
            response = requests.get(base_url, params=params, timeout=10)
            print(f"Статус ответа: {response.status_code}")
            if response.status_code == 429:
                wait_time = int(response.headers.get('Retry-After', retry_delay))
                print(f"Достигнут лимит запросов. Ожидание {wait_time} секунд...")
                time.sleep(wait_time)
                retry_delay *= 2
                continue
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list) and data and 'sparkline_in_7d' in data[0]:
                has_sparkline = 'price' in data[0]['sparkline_in_7d'] and data[0]['sparkline_in_7d']['price']
                print(f"Получены sparkline данные: {has_sparkline}")
                if not has_sparkline:
                    print("Sparkline данные отсутствуют в ответе API")
            return data
        except requests.exceptions.RequestException as e:
            print(f"Ошибка при запросе к CoinGecko (попытка {attempt+1}/{max_retries}): {e}")

            if hasattr(e, 'response') and hasattr(e.response, 'text'):
                print(f"Текст ответа: {e.response.text}")

            jitter = random.uniform(0.1, 1.0)
            sleep_time = retry_delay + jitter
            print(f"Повтор через {sleep_time:.1f} сек...")
            time.sleep(sleep_time)
            retry_delay *= 2

    print("Исчерпаны все попытки запроса к API")
    return None