import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ResizablePanel.css';

const ResizablePanel = ({ children, className = '' }) => {
  const [leftWidth, setLeftWidth] = useState(50); // Porcentaje inicial
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Calcular el nuevo porcentaje, con límites mínimos y máximos
    const newLeftWidth = Math.min(Math.max((mouseX / containerWidth) * 100, 20), 80);
    setLeftWidth(newLeftWidth);
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove]);

  const [leftChild, rightChild, ...otherChildren] = React.Children.toArray(children);

  return (
    <div className={`resizable-container ${className}`} ref={containerRef}>
      <div 
        className="resizable-left-panel"
        style={{ width: `${leftWidth}%` }}
      >
        {leftChild}
      </div>
      
      <div 
        className={`resizable-divider ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <div className="divider-handle">
          <div className="divider-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      </div>
      
      <div 
        className="resizable-right-panel"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightChild}
      </div>
      
      {/* Renderizar otros hijos fuera del panel redimensionable */}
      {otherChildren.map((child, index) => (
        <div key={index} className="additional-panel">
          {child}
        </div>
      ))}
    </div>
  );
};

export default ResizablePanel; 