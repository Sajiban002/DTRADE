import React from 'react';
import backgroundImage from '../photo/desk.jpg';
import '../style/news.css';

const NewsHero = () => {
  return (
    <div className="news-hero">
      <div className="news-hero-background">
        <img src={backgroundImage} alt="DTRADE Finance News Background" />
      </div>
      <div className="news-hero-content">
        <h1 className="news-hero-title">DTRADE FINANCE NEWS</h1>
      </div>
    </div>
  );
};

export default NewsHero;