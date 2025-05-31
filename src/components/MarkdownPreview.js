import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, FileText, Download, Copy, Check } from 'lucide-react';
import './MarkdownPreview.css';

const MarkdownPreview = ({ markdown }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDownload = () => {
    if (!markdown) return;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documento-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!markdown) return;
    
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    // Custom styling for tables
    table({ children }) {
      return (
        <div className="table-wrapper">
          <table>{children}</table>
        </div>
      );
    },
    // Custom styling for blockquotes
    blockquote({ children }) {
      return <blockquote className="custom-blockquote">{children}</blockquote>;
    },
    // Custom styling for links
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="custom-link">
          {children}
        </a>
      );
    }
  };

  return (
    <div className="markdown-preview">
      <div className="preview-header">
        <div className="preview-title">
          <Eye size={18} />
          <span>Vista Previa</span>
        </div>
        
        {markdown && (
          <div className="preview-actions">
            <button
              onClick={handleCopy}
              className={`action-button copy-button ${copySuccess ? 'success' : ''}`}
              title="Copiar markdown"
            >
              {copySuccess ? <Check size={16} /> : <Copy size={16} />}
              <span>{copySuccess ? 'Copiado' : 'Copiar'}</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="action-button download-button"
              title="Descargar archivo .md"
            >
              <Download size={16} />
              <span>Descargar</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="preview-content">
        {markdown ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
            className="markdown-body"
          >
            {markdown}
          </ReactMarkdown>
        ) : (
          <div className="empty-preview">
            <FileText size={48} className="empty-icon" />
            <h3>Sin contenido</h3>
            <p>Escribe o sube un archivo Markdown para ver la vista previa aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownPreview; 