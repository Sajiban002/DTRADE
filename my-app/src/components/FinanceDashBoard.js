import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../style/Finance.css';

const SearchBar = ({ placeholder, onChange, value }) => {
  const handleClear = () => {
    const clearEvent = { target: { value: '' } };
    onChange(clearEvent);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <svg
        className="search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      {value && (
        <button onClick={handleClear} className="clear-search" aria-label="Очистить поиск">
          ×
        </button>
      )}
    </div>
  );
};

const FinanceDashboard = () => {
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [cryptoData, setCryptoData] = useState({});
  const [cryptoLoading, setCryptoLoading] = useState(true);
  const [cryptoError, setCryptoError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/news');
        if (isMounted) {
          setNews(response.data || []);
          setNewsError(null);
          if (newsLoading) setNewsLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
        if (isMounted) {
          setNewsError('Не удалось загрузить новости.');
          setNews([]);
          setNewsLoading(false);
        }
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 15 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/crypto-data/');
        if (isMounted) {
          setCryptoData(response.data || {});
          setCryptoError(null);
          if (cryptoLoading) setCryptoLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при загрузке криптовалют:', error);
        if (isMounted) {
          setCryptoError('Не удалось загрузить данные криптовалют.');
          setCryptoLoading(false);
        }
      }
    };

    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 2 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getTopN = (data, sortFn, n = 5) => {
    if (typeof data !== 'object' || data === null) return [];
    return Object.values(data)
      .filter(coin => coin && typeof coin === 'object')
      .sort(sortFn)
      .slice(0, n);
  };

  const getTopGainers = (data) => getTopN(data, (a, b) => (b.price_change_24h || 0) - (a.price_change_24h || 0));
  const getTopLosers = (data) => getTopN(data, (a, b) => (a.price_change_24h || 0) - (b.price_change_24h || 0));

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) return '--';
    if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    if (price >= 0.01) return `$${price.toFixed(2)}`;
    if (price < 0.000001 && price > 0) return '< $0.000001';
    return `$${price.toFixed(8)}`;
  };

  const formatPercentage = (percentage) => {
    if (percentage == null || isNaN(percentage)) return '--';
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    setSearchTerm('');
  };

  const getDisplayedCryptoList = () => {
    if (typeof cryptoData !== 'object' || cryptoData === null || Object.keys(cryptoData).length === 0) {
      return [];
    }
    const dataValues = Object.values(cryptoData);

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return dataValues
        .filter(
          (coin) =>
            coin &&
            (coin.name?.toLowerCase().includes(lowerSearchTerm) ||
             coin.symbol?.toLowerCase().includes(lowerSearchTerm))
        )
        .slice(0, 5);
    }

    switch (activeTab) {
      case 'gainers':
        return getTopGainers(cryptoData);
      case 'losers':
        return getTopLosers(cryptoData);
      case 'all':
      default:
        return getTopN(cryptoData, (a, b) => (b.market_cap || 0) - (a.market_cap || 0));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Недавно';
    try {
      if (/^\d{8}T\d{6}$/.test(dateString)) {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const hours = dateString.substring(9, 11);
        const minutes = dateString.substring(11, 13);
        const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        if (!isNaN(date)) {
          return date.toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow'
          });
        }
      }

      const date = new Date(dateString);
      if (!isNaN(date)) {
        return date.toLocaleString('ru-RU', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
      }
      return dateString;
    } catch (e) {
      console.error('Ошибка форматирования даты:', dateString, e);
      return 'Недавно';
    }
  };

  const cryptoItems = getDisplayedCryptoList();

  return (
    <div className="main">
      <section className="news-section">
        {newsLoading ? (
          <div className="news-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка новостей...</p>
          </div>
        ) : newsError ? (
          <div className="news-error">{newsError}</div>
        ) : (
          <div className="news-content">
            <h2>Финансовые новости</h2>
            <div className="news-list">
              {Array.isArray(news) && news.length > 0 ? (
                news.map((item, index) => (
                  <div key={item.id || item.url || index} className="news-item">
                    <div className="news-image">
                      <img
                        src={item.image_url || 'https://via.placeholder.com/150/d3d3d3/ffffff?text=Новость'}
                        alt={item.title || 'Новость'}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150/ff0000/ffffff?text=Ошибка';
                        }}
                      />
                    </div>
                    <div className="news-details">
                      <h3>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.title || 'Без заголовка'}
                        </a>
                      </h3>
                      <p className="news-summary">{item.summary || 'Нет описания.'}</p>
                      <div className="news-meta">
                        <span className="news-source">{item.source || 'Неизвестный источник'}</span>
                        <span className="news-date">{formatDate(item.time_published)}</span>
                      </div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="read-more">
                        Читать дальше
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-news">Нет доступных новостей</p>
              )}
            </div>
          </div>
        )}
      </section>

      <aside className="crypto-aside">
        {cryptoLoading && Object.keys(cryptoData).length === 0 ? (
          <div className="crypto-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка данных...</p>
          </div>
        ) : cryptoError ? (
          <div className="crypto-error">{cryptoError}</div>
        ) : (
          <div className="crypto-content">
            <h2>Криптовалюты</h2>
            <SearchBar
              placeholder="Поиск криптовалют..."
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
            <div className="crypto-tabs">
              <button
                className={`crypto-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabClick('all')}
              >
                Все
              </button>
              <button
                className={`crypto-tab ${activeTab === 'gainers' ? 'active' : ''}`}
                onClick={() => handleTabClick('gainers')}
              >
                Лидеры роста
              </button>
              <button
                className={`crypto-tab ${activeTab === 'losers' ? 'active' : ''}`}
                onClick={() => handleTabClick('losers')}
              >
                Лидеры падения
              </button>
            </div>

            <div className="crypto-list-container">
              <div className="crypto-list">
                {cryptoItems.length > 0 ? (
                  cryptoItems.map((coin) => (
                    coin && coin.id ? (
                      <Link to={`/crypto/${coin.id}`} key={coin.id} className="crypto-item">
                        <div className="crypto-logo">
                          {coin.image ? (
                            <img src={coin.image} alt={coin.name || ''} />
                          ) : (
                            <div className="logo-placeholder">?</div>
                          )}
                        </div>
                        <div className="crypto-info">
                          <div className="crypto-name-symbol">
                            <h3>{coin.name || 'N/A'}</h3>
                            <span className="crypto-symbol">{(coin.symbol || '').toUpperCase()}</span>
                          </div>
                          <div className="crypto-price">
                            <span className="price-value">{formatPrice(coin.current_price)}</span>
                            <span
                              className={`price-change ${
                                coin.price_change_24h == null
                                  ? ''
                                  : coin.price_change_24h >= 0
                                  ? 'positive'
                                  : 'negative'
                              }`}
                            >
                              {formatPercentage(coin.price_change_24h)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ) : null
                  ))
                ) : (
                  <p className="no-crypto">
                    {searchTerm
                      ? 'Ничего не найдено'
                      : cryptoLoading
                      ? 'Загрузка...'
                      : activeTab === 'gainers'
                      ? 'Нет лидеров роста'
                      : activeTab === 'losers'
                      ? 'Нет лидеров падения'
                      : 'Нет доступных данных'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default FinanceDashboard;