from fastapi import APIRouter
from src.news_routes import router as news_router
from src.crypto_routes import router as crypto_router
from src.search_routes import router as search_router
from src.prediction_routes import router as prediction_router

router = APIRouter()

router.include_router(news_router)
router.include_router(crypto_router)
router.include_router(search_router)
router.include_router(prediction_router)