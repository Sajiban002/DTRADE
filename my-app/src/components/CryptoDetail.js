import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import '../style/CryptoDetail.css';

const CryptoDetail = () => {
    const { coinId } = useParams();
    const [coinData, setCoinData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        const fetchCoinData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/api/crypto-data/${coinId}`);
                setCoinData(response.data);
                console.log("Данные о криптовалюте:", response.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных о криптовалюте:', error);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchCoinData();
    }, [coinId]);

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
        return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
    };

    const getChartData = () => {
        if (!coinData || !coinData.sparkline_data || !Array.isArray(coinData.sparkline_data) || coinData.sparkline_data.length === 0) {
            console.log("Нет данных sparkline_data или некорректный формат");
            if (coinData && coinData.current_price) {
                const basePrice = coinData.current_price;
                const mockData = [];
                const now = new Date();
                for (let i = 0; i < 7; i++) {
                    const dateCopy = new Date(now);
                    dateCopy.setDate(now.getDate() - (7 - i));
                    const variation = basePrice * 0.05;
                    const randomFactor = 0.5 - Math.random();
                    const mockPrice = basePrice + (variation * randomFactor);
                    mockData.push({
                        time: dateCopy.toLocaleDateString(),
                        price: mockPrice,
                        pv: mockPrice
                    });
                }
                console.log("Сгенерированы временные данные для графика:", mockData);
                return mockData;
            }
            return [{ time: "Нет данных", price: 0, pv: 0 }];
        }

        const sparklineData = coinData.sparkline_data;
        console.log("Исходные sparklineData:", sparklineData);
        console.log("Длина sparklineData:", sparklineData.length);

        const now = new Date();
        let points = [];
        let step = 1;
        let daysAgo = 7;

        if (timeRange === '1d') {
            step = Math.max(1, Math.floor(sparklineData.length / 24));
            daysAgo = 1;
        } else if (timeRange === '7d') {
            step = Math.max(1, Math.floor(sparklineData.length / 7));
            daysAgo = 7;
        } else if (timeRange === '30d') {
            step = Math.max(1, Math.floor(sparklineData.length / 30));
            daysAgo = 30;
        }

        const dataLength = sparklineData.length;
        const numPoints = Math.min(dataLength, timeRange === '1d' ? 24 : (timeRange === '7d' ? 7 : 30));
        
        for (let i = 0; i < numPoints; i++) {
            const dataIndex = Math.min(Math.floor(i * dataLength / numPoints), dataLength - 1);
            const dateCopy = new Date(now);
            const dayOffset = daysAgo * (1 - i / (numPoints - 1));
            dateCopy.setDate(now.getDate() - dayOffset);
            points.push({
                time: dateCopy.toLocaleDateString(),
                price: sparklineData[dataIndex],
                pv: sparklineData[dataIndex]
            });
        }

        console.log("Преобразованные chartData:", points);
        return points;
    };

    const isPriceUp = coinData?.price_change_24h >= 0;
    const chartColor = isPriceUp ? '#00FF00' : '#FF4D4D';

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="time">{payload[0].payload.time}</p>
                    <p className="price">{formatPrice(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="crypto-detail-loading">
                <div className="loading-spinner"></div>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    if (error || !coinData) {
        return (
            <div className="crypto-detail-error">
                <h2>Ошибка</h2>
                <p>{error || 'Данные не найдены'}</p>
                <Link to="/news" className="back-button">Вернуться к новостям</Link>
            </div>
        );
    }

    const chartData = getChartData();

    return (
        <div className="crypto-detail">
            <div className="crypto-detail-header">
                <Link to="/news" className="back-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Назад
                </Link>

                <div className="crypto-header-info">
                    <div className="crypto-avatar">
                        <img src={coinData.image} alt={coinData.name} />
                    </div>
                    <div className="crypto-title">
                        <h1>{coinData.name}</h1>
                        <span className="crypto-detail-symbol">{coinData.symbol}</span>
                    </div>
                </div>
            </div>

            <div className="crypto-price-info">
                <div className="crypto-current-price">
                    <h2>{formatPrice(coinData.current_price)}</h2>
                    <span className={`crypto-price-change ${isPriceUp ? 'positive' : 'negative'}`}>
                        {formatPercentage(coinData.price_change_24h)}
                    </span>
                </div>

                <div className="crypto-market-cap">
                    <p>
                        Рыночная капитализация:
                        <span>${coinData.market_cap?.toLocaleString('en-US')}</span>
                    </p>
                </div>
            </div>

            <div className="crypto-chart-container">
                <div className="chart-time-controls">
                    <button
                        className={timeRange === '1d' ? 'active' : ''}
                        onClick={() => setTimeRange('1d')}
                    >
                        1Д
                    </button>
                    <button
                        className={timeRange === '7d' ? 'active' : ''}
                        onClick={() => setTimeRange('7d')}
                    >
                        7Д
                    </button>
                    <button
                        className={timeRange === '30d' ? 'active' : ''}
                        onClick={() => setTimeRange('30d')}
                    >
                        30Д
                    </button>
                </div>

                {chartData && chartData.length > 0 ? (
                    <div className="crypto-chart" style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: '#ccc' }}
                                    axisLine={{ stroke: '#333' }}
                                />
                                <YAxis
                                    domain={['dataMin', 'dataMax']}
                                    tick={{ fill: '#ccc' }}
                                    tickFormatter={(value) => formatPrice(value)}
                                    axisLine={{ stroke: '#333' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={chartColor}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p>Нет данных для графика.</p>
                )}
            </div>

            <div className="crypto-detail-info">
                <h3>О {coinData.name}</h3>
                <p className="crypto-description">
                    {coinData.name} ({coinData.symbol}) - одна из ведущих криптовалют на рынке с рыночной капитализацией ${coinData.market_cap?.toLocaleString('en-US')}. Текущая цена составляет {formatPrice(coinData.current_price)} с изменением за 24 часа {formatPercentage(coinData.price_change_24h)}.
                </p>
            </div>
        </div>
    );
};

export default CryptoDetail;