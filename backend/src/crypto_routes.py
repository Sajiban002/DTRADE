from fastapi import APIRouter, HTTPException
from src.crypto_service import fetch_crypto_data

router = APIRouter(prefix="/api/crypto-data", tags=["crypto"])


@router.get("/")
def get_crypto():
    crypto_data = fetch_crypto_data()

    if not crypto_data:
        print("Warning: fetch_crypto_data returned empty data.")
        return {}

    return crypto_data


@router.get("/{coin_id}")
def get_coin_details(coin_id: str):
    crypto_data = fetch_crypto_data()

    if not crypto_data or coin_id not in crypto_data:
        raise HTTPException(
            status_code=404, detail=f"Криптовалюта {coin_id} не найдена"
        )

    return crypto_data[coin_id]