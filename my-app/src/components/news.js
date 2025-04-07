import React from 'react';
import Desks from './desks';
import LogoCarousel from './logo';
import Desk from './desk';

const NewsPage = () => {
  return (
    <div className="news-page">
      <Desks />
      <LogoCarousel />
      <Desk />
    </div>
  );
};

export default NewsPage;