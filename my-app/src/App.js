import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';
import HomePage from './components/hero';
import NewsPage from './components/news';
import APIPage from './components/apipage';
import LoginPage from './components/loginpage';
import About from './components/about';
import CryptoPage from './components/CryptoPage';
import Account from './components/Account';
import AIPage from './components/ai';

function App() {
  return (
    <Router>
      <div className="content-wrapper">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/api" element={<APIPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<Account />} />
            <Route path="/about" element={<About />} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/crypto/*" element={<CryptoPage />} /> 
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;