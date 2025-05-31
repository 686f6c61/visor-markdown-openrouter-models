import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Eye, FileText } from 'lucide-react';
import './MarkdownPreview.css';

const MarkdownPreview = ({ markdown }) => {
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