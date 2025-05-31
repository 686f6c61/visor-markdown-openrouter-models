import React from 'react';
import { FileText, HelpCircle } from 'lucide-react';
import './Header.css';

const Header = ({ onShowHelp }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-center">
          <FileText className="header-icon" size={24} />
          <h1 className="header-title">Markdown Preview</h1>
          <span className="header-subtitle">Visor Markdown Vitaminado</span>
        </div>
        
        {onShowHelp && (
          <div className="header-actions">
            <button 
              onClick={onShowHelp}
              className="help-button"
              title="Ver tutorial de bienvenida"
            >
              <HelpCircle size={20} />
              <span>Ayuda</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 