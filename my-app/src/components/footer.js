import React from 'react';
import '../style/header-footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo">DTRADE</div>
          
          <div className="footer-addresses">
            <div className="address">
              <h3>New York City</h3>
              <p>55 Water Street</p>
              <p>New York, NY 10041</p>
            </div>
            
            <div className="address">
              <h3>Washington D.C.</h3>
              <p>1200 G Street Northwest</p>
              <p>Washington, DC 20005</p>
            </div>
          </div>
        </div>
        
        <div className="footer-center-line"></div>
        
        <div className="footer-right">
          <div className="footer-links-column">
            <a href="/contact">Contact</a>
            <a href="/terms">Web Terms</a>
            <a href="/email">Email</a>
            <a href="/twitter">Twitter</a>
          </div>
          
          <div className="footer-links-column">
            <a href="/privacy">Privacy police</a>
            <a href="/service">Service Terms</a>
            <a href="/linkedin">LinkedIn</a>
            <a href="/facebook">Facebook</a>
          </div>
        </div>
      </div>
      
      <div className="copyright">
        Copyright © 2025 Kensho Technologies, LLC. Kensho marks are the property of Kensho Technologies, LLC. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;