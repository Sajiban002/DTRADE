import React, { useState, useEffect } from 'react';
import { fetchCryptoSearch, fetchStockSearch, fetchPrediction } from '../services/assetService';
import SearchBar from '../components/SearchBar';
import '../style/ai.css';

const AIPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    useEffect(() => {
        if (searchTerm.length === 0) {
            setSearchResults([]);
            setSearching(false);
            setSearchError(null);
        }
    }, [searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length === 0) {
            setSearchResults([]);
            setSearching(false);
            setSearchError(null);
        }
    };

    const handleSearch = async () => {
        if (searchTerm.length < 2) {
            setSearchError("Введите не менее 2 символов для поиска");
            return;
        }
        setSearching(true);
        setSearchError(null);
        let cryptoResults = [];
        let stockResults = [];
        try {
            cryptoResults = await fetchCryptoSearch(searchTerm);
        } catch (error) {
            console.error("Ошибка в fetchCryptoSearch:", error);
        }
        try {
            stockResults = await fetchStockSearch(searchTerm);
        } catch (error) {
            console.error("Ошибка в fetchStockSearch:", error);
        }
        const combinedResults = [...cryptoResults, ...stockResults];
        if (combinedResults.length === 0) {
            setSearchError("Ничего не найдено. Попробуйте другой запрос.");
        } else {
            setSearchResults(combinedResults);
        }
        setSearching(false);
    };

    const handleAssetSelect = (asset) => {
        setSelectedAsset(asset);
        setSearchResults([]);
        setSearchTerm('');
    };

    const saveUserRequest = async (userId, requestData) => {
        try {
            const currentHost = window.location.hostname;
            const serverPort = 5000;
            const baseUrl = `http://${currentHost}:${serverPort}`;
            const response = await fetch(`${baseUrl}/api/v1/users/save-request/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ requestData: requestData }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Запрос успешно сохранен:', data);
            } else {
                console.error('Ошибка при сохранении запроса:', data.message);
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса на сервер:', error);
        }
    };


    const handlePredictionRequest = async () => {
        if (!selectedAsset) return;

        setLoading(true);
        setPrediction(null);

        try {
            const predictionData = await fetchPrediction(selectedAsset);
            setPrediction(predictionData);

            // Создаем объект requestData для сохранения
            const requestData = {
                selectedAsset: selectedAsset,
                prediction: predictionData,
                 searchTerm: searchTerm,  // Save search term
                // Другие данные, которые вы хотите сохранить
            };

            // Получаем ID пользователя из localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.id) {
                // Сохраняем запрос пользователя
                await saveUserRequest(user.id, requestData);
            } else {
                console.error('ID пользователя не найден в localStorage');
            }


        } catch (error) {
            console.error("Ошибка при получении прогноза:", error);
            alert("Произошла ошибка при получении прогноза. Пожалуйста, попробуйте снова.");
        } finally {
            setLoading(false);
        }
    };

    const getAssetTypeLabel = (type) => {
        switch (type) {
            case 'crypto': return 'Криптовалюта';
            case 'stock': return 'Акция';
            case 'currency': return 'Валюта';
            default: return type;
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '--';
        if (price >= 1000) {
            return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
        } else if (price >= 1) {
            return `$${price.toFixed(2)}`;
        } else {
            return `$${price.toFixed(6)}`;
        }
    };

    const formatPercentage = (percentage) => {
        if (!percentage && percentage !== 0) return '--';
        return `${percentage >= 0 ? '+' : ''}${percentage}%`;
    };


    return (
        <div className="ai-page">
            <div className="ai-container">
                <div className="ai-header">
                    <h1 className="ai-title">DT</h1>
                    <p className="ai-subtitle">Введите запрос, и мы сделаем прогноз</p>
                </div>

                <div className="search-section">
                    <div className="search-container">
                        <SearchBar
                            placeholder="Поиск криптовалют, акций или валют..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <button
                            className="search-button"
                            onClick={handleSearch}
                            disabled={searchTerm.length < 2 || searching}
                        >
                            {searching ? 'Поиск...' : 'Найти'}
                        </button>
                    </div>

                    {searching && (
                        <div className="search-loading">
                            <div className="loading-spinner"></div>
                            <p>Выполняется поиск...</p>
                        </div>
                    )}

                    {searchError && !searching && (
                        <div className="search-error">{searchError}</div>
                    )}

                    {searchResults.length > 0 && !searching && (
                        <div className="search-results">
                            <div className="search-results-header">
                                Выберите актив из списка:
                            </div>
                            {searchResults.map((result) => (
                                <div
                                    key={`${result.type}-${result.id}`}
                                    className="search-result-item"
                                    onClick={() => handleAssetSelect(result)}
                                >
                                    {result.image && <img src={result.image} alt={result.name} className="result-image" />}
                                    {!result.image && (
                                        <div className="placeholder-image">
                                            {result.symbol ? result.symbol.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    )}
                                    <div className="result-info">
                                        <span className="result-name">{result.name}</span>
                                        <span className="result-symbol">{result.symbol}</span>
                                    </div>
                                    <span className="result-type">{getAssetTypeLabel(result.type)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedAsset && (
                    <div className="selected-asset">
                        <div className="asset-header">Выбранный актив</div>
                        <div className="asset-card">
                            <div className="asset-image">
                                {selectedAsset.image ? (
                                    <img src={selectedAsset.image} alt={selectedAsset.name} />
                                ) : (
                                    <div className="asset-image-placeholder">
                                        {selectedAsset.symbol ? selectedAsset.symbol.charAt(0).toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                            <div className="asset-info">
                                <h3>{selectedAsset.name} ({selectedAsset.symbol.toUpperCase()})</h3>
                                <p className="asset-type">{getAssetTypeLabel(selectedAsset.type)}</p>
                            </div>
                            <button
                                className="predict-button"
                                onClick={handlePredictionRequest}
                                disabled={loading}
                            >
                                {loading ? 'Анализ...' : 'Получить прогноз'}
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="loading-container">
                        <div className="loading-animation"></div>
                        <p>Анализ рыночных данных...</p>
                        <p className="loading-subtext">Это может занять несколько секунд</p>
                    </div>
                )}

                {prediction && !loading && (
                    <div className="prediction-container">
                        <div className="short-prediction">
                            <h2>Прогноз для {selectedAsset.name} ({selectedAsset.symbol.toUpperCase()})</h2>
                            <div className="prediction-result">
                                <span className={`prediction-value ${prediction.direction === 'up' ? 'positive' : 'negative'}`}>
                                    {prediction.direction === 'up' ? '↑' : '↓'} {prediction.percentage}%
                                </span>
                                <p className="prediction-summary">{prediction.summary}</p>
                            </div>
                        </div>

                        {prediction.yf_info && selectedAsset.type !== 'crypto' && (
                            <div className="stock-data-table">
                                <h3>Данные об активе</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Показатель</th>
                                            <th>Значение</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Символ</td>
                                            <td>{prediction.yf_info.symbol}</td>
                                        </tr>
                                        <tr>
                                            <td>Имя</td>
                                            <td>{prediction.yf_info.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Текущая цена</td>
                                            <td>{formatPrice(prediction.yf_info.current_price)}</td>
                                        </tr>
                                        <tr>
                                            <td>Открытие</td>
                                            <td>{formatPrice(prediction.yf_info.open)}</td>
                                        </tr>
                                        <tr>
                                            <td>Максимум за день</td>
                                            <td>{formatPrice(prediction.yf_info.high)}</td>
                                        </tr>
                                        <tr>
                                            <td>Минимум за день</td>
                                            <td>{formatPrice(prediction.yf_info.low)}</td>
                                        </tr>
                                        <tr>
                                            <td>Объем</td>
                                            <td>{prediction.yf_info.volume?.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td>Тип</td>
                                            <td>{getAssetTypeLabel(selectedAsset.type)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}


                        <div className="detailed-analysis">
                            <h3>Детальный анализ</h3>
                            <div className="analysis-content">
                                {prediction.analysis}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIPage;