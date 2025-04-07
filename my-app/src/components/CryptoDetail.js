import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart,
    Line,
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
    const [chartData, setChartData] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchCoinData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:8000/api/crypto-data/${coinId}?timeRange=${timeRange}`);
                setCoinData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных о криптовалюте:', error);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
                setLoading(false);
            }
        };

        fetchCoinData();
    }, [coinId]);

    useEffect(() => {
        if (coinData) {
            setIsAnimating(true);
            const newChartData = getChartData(coinData, timeRange);
            setChartData(newChartData);
            
            const timer = setTimeout(() => setIsAnimating(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [coinData, timeRange]);

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

    const getChartData = (coinData, timeRange) => {
        if (!coinData || !coinData.sparkline_data || !Array.isArray(coinData.sparkline_data) || coinData.sparkline_data.length === 0) {
            return coinData && coinData.current_price ? generateMockData(coinData.current_price, timeRange) : [{ time: "Нет данных", price: 0, timestamp: 0 }];
        }

        const sparklineData = coinData.sparkline_data;
        const now = new Date();
        const numPoints = timeRange === '1d' ? 24 : timeRange === '7d' ? 28 : 30;
        const interval = {
            '1d': { unit: 'hour', total: 24 },
            '7d': { unit: 'day', total: 7 },
            '30d': { unit: 'day', total: 30 }
        }[timeRange];
        const dataInterval = Math.max(1, Math.floor(sparklineData.length / numPoints));

        return Array.from({ length: numPoints }, (_, i) => {
            let dataIndex;
            if (timeRange === '1d') {
                dataIndex = Math.max(0, sparklineData.length - numPoints + i);
            } else if (timeRange === '7d') {
                dataIndex = Math.min(Math.floor(i * sparklineData.length / numPoints), sparklineData.length - 1);
            } else {
                dataIndex = Math.min(Math.floor(i * (sparklineData.length * 0.8) / numPoints), sparklineData.length - 1);
            }

            const basePrice = sparklineData[dataIndex];
            const randomFactor = 1 + (Math.random() * 0.02 - 0.01);

            const dateCopy = new Date(now);

            if (timeRange === '1d') {
                dateCopy.setHours(now.getHours() - (interval.total - i));
                return {
                    time: dateCopy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: basePrice * randomFactor,
                    timestamp: dateCopy.getTime()
                };
            } else {
                dateCopy.setDate(now.getDate() - (interval.total - i * interval.total / numPoints));
                return {
                    time: dateCopy.toLocaleDateString(),
                    price: basePrice * randomFactor,
                    timestamp: dateCopy.getTime()
                };
            }
        });
    };

    const generateMockData = (basePrice, timeRange) => {
        const patterns = {
            '1d': { frequencyFactor: 6, amplitudeFactor: 0.03 },
            '7d': { frequencyFactor: 2, amplitudeFactor: 0.07 },
            '30d': { frequencyFactor: 1, amplitudeFactor: 0.15 }
        };

        const { frequencyFactor, amplitudeFactor } = patterns[timeRange];
        const numPoints = timeRange === '1d' ? 24 : timeRange === '7d' ? 28 : 30;
        const now = new Date();

        return Array.from({ length: numPoints }, (_, i) => {
            const dateCopy = new Date(now);
            const timeProgress = i / (numPoints - 1);

            if (timeRange === '1d') {
                dateCopy.setHours(now.getHours() - (24 - i));
                const hourFactor = Math.sin(timeProgress * Math.PI * frequencyFactor) * amplitudeFactor;
                const smallFluctuation = (Math.random() - 0.5) * 0.01;
                const mockPrice = basePrice * (1 + hourFactor + smallFluctuation);

                return {
                    time: dateCopy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: mockPrice,
                    timestamp: dateCopy.getTime()
                };
            } else {
                const totalDays = timeRange === '7d' ? 7 : 30;
                const dayOffset = totalDays * (1 - timeProgress);
                dateCopy.setDate(now.getDate() - dayOffset);

                const sinFactor = Math.sin(timeProgress * Math.PI * frequencyFactor) * amplitudeFactor;
                const trendFactor = timeRange === '30d' ? (timeProgress - 0.5) * 0.1 : 0;

                const mockPrice = basePrice * (1 + sinFactor + trendFactor);

                return {
                    time: dateCopy.toLocaleDateString(),
                    price: mockPrice,
                    timestamp: dateCopy.getTime()
                };
            }
        });
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

    const CustomizedDot = (props) => {
        const { cx, cy, payload, index, data } = props;
        if (index % 10 !== 0 && index !== data.length - 1) return null;
        return (
            <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={chartColor}
                stroke="#111"
                strokeWidth={1}
                className="chart-dot"
            />
        );
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
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={chartColor} stopOpacity={0.1} />
                                    </linearGradient>
                                    <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                                        <feGaussianBlur stdDeviation="2" result="glow" />
                                        <feMerge>
                                            <feMergeNode in="glow" />
                                            <feMergeNode in="glow" />
                                            <feMergeNode in="glow" />
                                        </feMerge>
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeOpacity={0.5} />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fill: '#ccc' }}
                                    axisLine={{ stroke: '#333' }}
                                    tickLine={{ stroke: '#333' }}
                                />
                                <YAxis
                                    domain={['dataMin', 'dataMax']}
                                    tick={{ fill: '#ccc' }}
                                    tickFormatter={(value) => formatPrice(value)}
                                    axisLine={{ stroke: '#333' }}
                                    tickLine={{ stroke: '#333' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="price"
                                    stroke={chartColor}
                                    strokeWidth={3}
                                    dot={<CustomizedDot data={chartData} />}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: chartColor, filter: 'url(#glow)' }}
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                    animationEasing="ease-in-out"
                                    animationBegin={0}
                                />
                            </LineChart>
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
