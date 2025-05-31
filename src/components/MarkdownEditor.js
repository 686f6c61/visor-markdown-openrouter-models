import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, Copy, Clipboard, Undo } from 'lucide-react';
import './MarkdownEditor.css';

const MarkdownEditor = ({ markdown, onChange, onSelectionChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (file) => {
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md'))) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange(e.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Por favor, selecciona un archivo Markdown (.md)');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleTextareaChange = (e) => {
    const newValue = e.target.value;
    saveToHistory(markdown);
    onChange(newValue);
  };

  const saveToHistory = (content) => {
    if (content !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(content);
      if (newHistory.length > 50) { // Limitar historial a 50 entradas
        newHistory.shift();
      } else {
        setHistoryIndex(historyIndex + 1);
      }
      setHistory(newHistory);
    }
  };

  const undoChange = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      onChange(history[historyIndex - 1]);
    }
  };

  // Inicializar historial
  useEffect(() => {
    if (markdown && history.length === 0) {
      setHistory([markdown]);
      setHistoryIndex(0);
    }
  }, [markdown, history.length]);

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      const selectedText = markdown.substring(selectionStart, selectionEnd);
      onSelectionChange(selectedText.trim());
    }
  };

  const clearContent = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      // Fallback para navegadores que no soportan clipboard API
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Error al pegar:', err);
      // Fallback: focus en el textarea para que el usuario pueda pegar manualmente
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  return (
    <div className="markdown-editor">
      <div className="editor-header">
        <div className="editor-title">
          <FileText size={18} />
          <span>Editor Markdown</span>
        </div>
        <div className="editor-actions">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="action-button upload-button"
            title="Subir archivo MD"
          >
            <Upload size={16} />
            <span>Subir</span>
          </button>
          <button
            onClick={pasteFromClipboard}
            className="action-button paste-button"
            title="Pegar desde portapapeles"
          >
            <Clipboard size={16} />
            <span>Pegar</span>
          </button>
          {markdown && (
            <>
              <button
                onClick={copyToClipboard}
                className={`action-button copy-button ${copySuccess ? 'success' : ''}`}
                title={copySuccess ? "¡Copiado!" : "Copiar contenido"}
              >
                <Copy size={16} />
                <span>{copySuccess ? '¡Copiado!' : 'Copiar'}</span>
              </button>
              {historyIndex > 0 && (
                <button
                  onClick={undoChange}
                  className="action-button undo-button"
                  title="Deshacer último cambio"
                >
                  <Undo size={16} />
                  <span>Deshacer</span>
                </button>
              )}
              <button
                onClick={clearContent}
                className="action-button clear-button"
                title="Limpiar contenido"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        className={`editor-content ${isDragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={handleTextareaChange}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder={!markdown ? "Escribe o pega tu Markdown aquí, o arrastra un archivo .md..." : "Escribe o pega tu Markdown aquí..."}
          className="markdown-textarea"
          spellCheck="false"
        />
        {!markdown && (
          <div className="empty-overlay">
            <div className="empty-state">
              <Upload size={48} className="empty-icon" />
              <h3>Sube o pega tu Markdown</h3>
              <p>Arrastra un archivo .md aquí o pega tu contenido directamente</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="upload-button-large"
              >
                <Upload size={20} />
                Seleccionar archivo
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default MarkdownEditor; 