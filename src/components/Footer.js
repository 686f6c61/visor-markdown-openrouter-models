import React from 'react';
import { Heart, Zap } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-text">
            Desarrollado con <Heart size={14} className="heart-icon" /> por <strong>686f6c61</strong>
          </span>
          <span className="tech-stack">
            <Zap size={12} className="tech-icon" />
            Desarrollado con React + OpenRouter
          </span>
        </div>
        
        <div className="footer-right">
          <span className="footer-year">© {currentYear}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 