import os
from dotenv import load_dotenv

load_dotenv()

COIN_GECKO_API_KEY = os.getenv("COIN_GECKO_API_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
NEWS_CACHE_TIME = int(os.getenv("NEWS_CACHE_TIME", 3600))
CRYPTO_CACHE_TIME = int(os.getenv("CRYPTO_CACHE_TIME", 1800))
GENERATE_MOCK_DATA = os.getenv("GENERATE_MOCK_DATA", "False").lower() in ("true", "1", "t")

print(f"GENERATE_MOCK_DATA set to: {GENERATE_MOCK_DATA}")
print(f"GEMINI_API_KEY loaded: {'Yes' if GEMINI_API_KEY else 'No'}")