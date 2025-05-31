import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Header from './components/Header';
import MarkdownEditor from './components/MarkdownEditor';
import MarkdownPreview from './components/MarkdownPreview';
import AIPanel from './components/AIPanel';
import Footer from './components/Footer';
import FloatingGitHub from './components/FloatingGitHub';
import WelcomeModal from './components/WelcomeModal';
import openRouterService from './services/openRouterService';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);

  // Precargar README al iniciar la aplicación
  useEffect(() => {
    // Verificar si es la primera visita
    const hasSeenWelcome = localStorage.getItem('welcomeModalSeen');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }

    const loadReadme = async () => {
      try {
        const response = await fetch('/README.md');
        if (response.ok) {
          const readmeContent = await response.text();
          setMarkdown(readmeContent);
        } else {
          // Fallback si no se puede cargar el README
          setMarkdown(`# 🚀 Visor Markdown Vitaminado ⚡

¡Bienvenido al editor de Markdown más potente con IA integrada!

## ✨ Características

- 📝 **Editor Avanzado** - Escribe y edita Markdown con facilidad
- 👁️ **Vista Previa** - Renderizado en tiempo real
- 🤖 **IA Vitaminada** - 10 modelos gratuitos para mejorar contenido
- 🎯 **Mejora Selectiva** - Mejora solo el texto seleccionado
- 📋 **Clipboard** - Copiar y pegar con un clic
- 🔄 **Historial** - Deshacer cambios fácilmente

## 🚀 Cómo usar

1. **Escribe** o **pega** tu contenido Markdown
2. **Selecciona** texto específico (opcional)
3. **Elige** un modelo de IA
4. **Mejora** tu contenido con un clic

¡Comienza editando este texto o carga tu propio archivo!`);
        }
      } catch (error) {
        console.error('Error loading README:', error);
        // Fallback content
        setMarkdown(`# 🚀 Visor Markdown Vitaminado

¡Bienvenido! Comienza escribiendo tu contenido Markdown aquí.

## Características
- Editor con vista previa en tiempo real
- Mejora de contenido con IA
- 10 modelos gratuitos disponibles

¡Empieza a escribir!`);
      }
    };

    loadReadme();
  }, []);

  const handleMarkdownChange = (newMarkdown) => {
    setMarkdown(newMarkdown);
  };

  const handleSelectionChange = (selection) => {
    setSelectedText(selection);
  };

  const handleImprove = async (prompt, modelId, textToImprove) => {
    setIsLoading(true);
    try {
      const improvedText = await openRouterService.improveMarkdown(
        markdown,
        prompt,
        modelId,
        textToImprove
      );

      if (textToImprove) {
        // Replace selected text with improved version
        const startIndex = markdown.indexOf(textToImprove);
        if (startIndex !== -1) {
          const beforeText = markdown.substring(0, startIndex);
          const afterText = markdown.substring(startIndex + textToImprove.length);
          setMarkdown(beforeText + improvedText + afterText);
        }
        setSelectedText(''); // Clear selection after improvement
      } else {
        // Replace entire document
        setMarkdown(improvedText);
      }
    } catch (error) {
      console.error('Error improving markdown:', error);
      throw error; // Re-throw to let AIPanel handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleShowHelp = () => {
    setShowWelcomeModal(true);
  };

  const toggleAIPanel = () => {
    console.log('Toggle AI Panel clicked, current state:', showAIPanel);
    setShowAIPanel(!showAIPanel);
  };

  return (
    <div className="app">
      <Header onShowHelp={handleShowHelp} />
      
      <main className="main-content">
        <div className="content-grid">
          <div className="editor-section">
            <MarkdownEditor
              markdown={markdown}
              onChange={handleMarkdownChange}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          
          <div className="preview-section">
            <MarkdownPreview markdown={markdown} />
          </div>
          
          <div className={`ai-section ${showAIPanel ? 'mobile-visible' : ''}`}>
            <AIPanel
              onImprove={handleImprove}
              selectedText={selectedText}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Overlay para cerrar panel en móviles */}
        {showAIPanel && (
          <div 
            className="mobile-overlay"
            onClick={toggleAIPanel}
          />
        )}
        
        {/* Botón flotante para móviles */}
        <button 
          className="mobile-ai-toggle"
          onClick={toggleAIPanel}
          title={showAIPanel ? 'Ocultar IA' : 'Mostrar IA'}
        >
          <Sparkles size={20} />
          {selectedText && <span className="selection-dot"></span>}
        </button>
      </main>
      
      <Footer />
      <FloatingGitHub />
      
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />
    </div>
  );
}

export default App;