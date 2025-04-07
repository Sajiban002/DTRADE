from fastapi import APIRouter, HTTPException
from src.news_service import fetch_news

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("/")
def get_news():
    news_data = fetch_news()

    if not news_data:
        raise HTTPException(status_code=404, detail="Новости не найдены")

    return news_data