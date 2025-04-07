import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CryptoWidget from '../components/FinanceDashBoard'; 
import CryptoDetail from '../components/CryptoDetail'; 

const CryptoPage = () => {
  return (
    <div className="crypto-page-container"> 
      <Routes>
         <Route path="/" element={<CryptoWidget />} /> 
        <Route path="/:coinId" element={<CryptoDetail />} /> 
      </Routes>
    </div>
  );
};

export default CryptoPage;