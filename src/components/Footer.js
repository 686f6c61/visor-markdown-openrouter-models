import React from 'react';
import { Heart, Github, Zap } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const githubUser = process.env.REACT_APP_GITHUB_USER;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-text">
            Hecho con <Heart size={14} className="heart-icon" /> por{' '}
            {githubUser ? (
              <a 
                href={`https://github.com/${githubUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-user-link"
              >
                <Github size={14} />
                {githubUser}
              </a>
            ) : (
              'el equipo de desarrollo'
            )}
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