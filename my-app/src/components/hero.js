import React, { useState, useEffect, useRef } from 'react';
import '../style/hero.css';

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    users: 0,
    members: 0,
    requests: 0
  });
  
  const targetNumbers = {
    users: 14000,
    members: 500,
    requests: 300000
  };
  
  const animationDuration = 6000; 
  const counterRef = useRef(null);
  
  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    const startTime = Date.now();
    
    const updateCounters = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      const easeOutQuad = (t) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      setCounters({
        users: Math.round(easedProgress * targetNumbers.users),
        members: Math.round(easedProgress * targetNumbers.members),
        requests: Math.round(easedProgress * targetNumbers.requests)
      });
      
      if (progress < 1) {
        requestAnimationFrame(updateCounters);
      }
    };
    
    requestAnimationFrame(updateCounters);
  }, []);
  
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${Math.floor(num / 1000000)}M+`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K+`;
    }
    return num.toString();
  };
  
  return (
    <section className={`hero ${isVisible ? 'visible' : ''}`}>
      <div className="hero-content">
        <h1 className={`hero-title ${isVisible ? 'visible' : ''}`}>
          AI-Powered Market<br />
          Predictions - Stay<br />
          Ahead of the Trends!
        </h1>
        
        <div className={`statscon ${isVisible ? 'visible' : ''}`}>
          <div className="statitem">
            <div className="statnum">{formatNumber(counters.users)}</div>
            <div className="statlab">ACTIVE USERS</div>
          </div>
          
          <div className="statdivide"></div>
          
          <div className="statitem">
            <div className="statnum">{formatNumber(counters.members)}</div>
            <div className="statlab">MEMBERS</div>
          </div>
          
          <div className="statdivide"></div>
          
          <div className="statitem">
            <div className="statnum">{formatNumber(counters.requests)}</div>
            <div className="statlab">REQUESTS</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;