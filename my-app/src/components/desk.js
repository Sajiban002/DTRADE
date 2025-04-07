import React from 'react';
import NewsWidget from './FinanceDashBoard';
import '../style/desk.css';

const Desk = () => {
  return (
    <div className="desk">
      <div className="main-content">
        <NewsWidget />
      </div>
    </div>
  );
};

export default Desk;