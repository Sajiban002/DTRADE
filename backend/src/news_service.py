import json
import time
import os
from datetime import datetime
import requests
from src.config import NEWS_CACHE_TIME, GNEWS_API_KEY

CACHE_FILE = "data/news_cache.json"

os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)

def get_cached_news():
    """Возвращает закэшированные новости, если они актуальны"""
    try:
        if os.path.exists(CACHE_FILE):
            with open(CACHE_FILE, "r") as f:
                cache = json.load(f)

            if time.time() - cache["timestamp"] < NEWS_CACHE_TIME:
                print(
                    f"Используется кэш новостей. Время до обновления: {NEWS_CACHE_TIME - (time.time() - cache['timestamp'])} сек."
                )
                return cache["data"]
    except Exception as e:
        print(f"Ошибка при чтении кэша новостей: {e}")

    return None

def cache_news(news_data):
    """Сохраняет новости в кэш"""
    try:
        cache = {
            "timestamp": time.time(),
            "data": news_data,
        }

        with open(CACHE_FILE, "w") as f:
            json.dump(cache, f)
        print(f"Новости успешно сохранены в кэш: {len(news_data)} записей")
    except Exception as e:
        print(f"Ошибка при сохранении кэша новостей: {e}")

def fetch_news():
    print("Запускаю fetch_news()")

    cached_news = get_cached_news()
    if cached_news:
        print("Возвращаю данные из кэша")
        return cached_news
    
    try:
        print("Кэш не найден или устарел, делаю запрос к GNews API")

        base_url = "https://gnews.io/api/v4/search"
        params = {
            "q": "bitcoin OR Trump OR stock market OR cryptocurrency",  
            "lang": "en",  
            "max": 10,
            "apikey": GNEWS_API_KEY,
        }

        response = requests.get(base_url, params=params)
        response.raise_for_status()

        data = response.json()

        processed_news = []
        seen_urls = set()  
        seen_titles = set()  

        if data and "articles" in data:
            for item in data["articles"]:
                url = item.get("url", "")
                title = item.get("title", "")

                if url in seen_urls or title in seen_titles:
                    print(f"Пропущена дублирующаяся новость: {title}")
                    continue

                seen_urls.add(url)
                seen_titles.add(title)

                news_item = {
                    "title": title,
                    "summary": item.get("description", ""),
                    "url": url,
                    "source": item.get("source", {}).get("name", ""),
                    "time_published": item.get("publishedAt", ""),
                    "image_url": item.get("image", "https://placehold.co/600x400?text=News"),
                }
                processed_news.append(news_item)

        print(f"Получено уникальных новостей от API: {len(processed_news)}")

        if processed_news:
            cache_news(processed_news)
            return processed_news

        print("Не удалось получить данные с GNews API, использую резервные данные")
        return _get_fallback_news()

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP ошибка при получении новостей: {http_err}")
        print(f"Status code: {response.status_code}")
        print(f"Response text: {response.text}")
        import traceback
        traceback.print_exc()
        print("Использую резервные данные из-за ошибки HTTP")
        return _get_fallback_news()

    except Exception as e:
        print(f"Ошибка при получении новостей: {e}")
        import traceback
        traceback.print_exc()
        print("Использую резервные данные из-за ошибки")
        return _get_fallback_news()

def _get_fallback_news():
    """Создает резервные новости в случае отсутствия данных от API"""
    current_date = datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

    test_news = [
        {
            "title": "Рост инфляции замедлился",
            "summary": "Последние данные показывают замедление темпов роста инфляции, что может повлиять на решения центрального банка.",
            "url": "https://example.com/finance-news1",
            "source": "Financial Times",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Inflation",
        },
        {
            "title": "Биткоин достигает нового максимума",
            "summary": "Криптовалюта биткоин продолжает расти на фоне интереса институциональных инвесторов.",
            "url": "https://example.com/crypto-news1",
            "source": "CoinDesk",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Bitcoin",
        },
        {
            "title": "Политические дебаты накаляются перед выборами",
            "summary": "Кандидаты активно обсуждают экономическую политику в преддверии выборов.",
            "url": "https://example.com/politics-news1",
            "source": "BBC",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Politics",
        },
        {
            "title": "Рынок акций демонстрирует устойчивость",
            "summary": "Несмотря на экономические вызовы, рынок акций показывает признаки устойчивости.",
            "url": "https://example.com/finance-news2",
            "source": "MarketWatch",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Stock+Market",
        },
        {
            "title": "Новые законы о криптовалютах в США",
            "summary": "Конгресс рассматривает новые регуляции для криптовалютного рынка.",
            "url": "https://example.com/crypto-news2",
            "source": "Reuters",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Crypto+Regulation",
        },
        {
            "title": "Правительство объявляет о налоговых реформах",
            "summary": "Новые налоговые изменения могут повлиять на бизнес и граждан.",
            "url": "https://example.com/politics-news2",
            "source": "The Guardian",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Tax+Reform",
        },
        {
            "title": "Блокчейн меняет финансовый сектор",
            "summary": "Технология блокчейн внедряется в банковские системы по всему миру.",
            "url": "https://example.com/crypto-news3",
            "source": "Bloomberg",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Blockchain",
        },
        {
            "title": "Центральный банк сохраняет ставки",
            "summary": "Процентные ставки остаются неизменными для поддержки экономики.",
            "url": "https://example.com/finance-news3",
            "source": "Wall Street Journal",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Interest+Rates",
        },
        {
            "title": "Политический скандал потряс рынок",
            "summary": "Недавний скандал вызвал волатильность на финансовых рынках.",
            "url": "https://example.com/politics-news3",
            "source": "CNN",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Political+Scandal",
        },
        {
            "title": "Золото растет на фоне нестабильности",
            "summary": "Золото остается активом-убежищем в условиях политической и экономической неопределенности.",
            "url": "https://example.com/finance-news4",
            "source": "Reuters",
            "time_published": current_date,
            "image_url": "https://placehold.co/600x400?text=Gold",
        }
    ]

    cache_news(test_news)
    return test_news