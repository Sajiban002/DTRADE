// frontend/src/services/assetService.js
const BASE_URL = 'http://127.0.0.1:8000';

export const fetchCryptoSearch = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/api/crypto/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Crypto search failed: ${response.status}`, errorData);
      throw new Error(`Crypto search failed: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw crypto search response:", data);
    if (!Array.isArray(data)) {
      console.error("Unexpected response format from crypto search:", data);
      throw new Error("Unexpected response format from crypto search");
    }
    return data.map(item => ({
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      image: item.image || null,
      type: item.type || 'crypto',
      current_price: item.current_price || 0
    }));
  } catch (error) {
    console.error("Error in fetchCryptoSearch:", error);
    return [];
  }
};


export const fetchStockSearch = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/api/stocks/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Stock search failed: ${response.status}`, errorData);
      throw new Error(`Stock search failed: ${response.status}`);
    }
    const data = await response.json();
    console.log("Raw stock search response:", data);
    if (!Array.isArray(data)) {
      console.error("Unexpected response format from stock search:", data);
      throw new Error("Unexpected response format from stock search");
    }
    return data.map(item => {
      return {
        id: item.id || item.symbol,
        name: item.name || item.symbol,
        symbol: item.symbol,
        image: item.image || null,
        type: item.type || 'stock',
        current_price: item.current_price || 0
      };
    });
  } catch (error) {
    console.error("Error in fetchStockSearch:", error);
    return [];
  }
};

export const fetchPrediction = async (asset) => {
    try {
        const payload = {
            assetType: asset.type,
            assetId: asset.id,
            assetName: asset.name,
            assetSymbol: asset.symbol
        };
        console.log("Sending prediction payload:", payload);

        const response = await fetch(`${BASE_URL}/api/prediction/`, { // Fixed endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Prediction failed: ${response.status}`, errorText);
            throw new Error(`Prediction failed: ${response.status}. ${errorText}`);
        }

        const data = await response.json();
        console.log("Raw prediction response:", data);

        if (!data || typeof data.direction === 'undefined' || typeof data.percentage === 'undefined' || typeof data.summary === 'undefined' || typeof data.analysis === 'undefined') {
           console.error("Unexpected prediction response format:", data);
           throw new Error("Unexpected prediction response format");
        }

        return data;
    } catch (error) {
        console.error("Error fetching prediction:", error);
        throw error;
    }
};