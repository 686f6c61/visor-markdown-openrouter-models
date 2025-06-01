import React, { useState } from 'react';
import { Sparkles, Send, Loader2, AlertCircle, Crown, Zap, ExternalLink, Eye, Power } from 'lucide-react';
import { getEnabledModels } from '../config/models';
import './AIPanel.css';

const AIPanel = ({ onImprove, selectedText, isLoading, tokensConsumed }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  
  const enabledModels = getEnabledModels();

  React.useEffect(() => {
    if (enabledModels.length > 0 && !selectedModel && isAIEnabled) {
      // Buscar Gemma 3 4B como modelo predeterminado
      const gemma3 = enabledModels.find(model => 
        model.id === 'google/gemma-3-4b-it'
      );
      
      // Si encontramos Gemma 3, lo seleccionamos, sino el primero disponible
      setSelectedModel(gemma3 ? gemma3.id : enabledModels[0].id);
    }
  }, [enabledModels, selectedModel, isAIEnabled]);

  const handleImprove = async () => {
    if (!selectedModel) {
      setError('Por favor, selecciona un modelo');
      return;
    }

    setError('');
    try {
      await onImprove(prompt.trim(), selectedModel, selectedText);
      if (!selectedText) {
        setPrompt(''); // Clear prompt only for full document improvements
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickPrompt = (quickPrompt) => {
    setPrompt(quickPrompt);
  };

  const quickPrompts = [
    'Corrige errores gramaticales y mejora la fluidez del texto',
    'Simplifica el lenguaje manteniendo el significado original',
    'Mejora la estructura y organización del contenido',
    'Añade ejemplos concretos y detalles relevantes',
    'Optimiza para mayor claridad y comprensión',
    'Convierte en formato profesional con mejor estructura'
  ];

  // Modo visor simple cuando IA está desactivada
  if (!isAIEnabled) {
    return (
      <div className="ai-panel viewer-mode">
        <div className="ai-toggle-section">
          <div className="ai-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isAIEnabled}
                onChange={(e) => setIsAIEnabled(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                <Power size={16} />
                IA {isAIEnabled ? 'Activada' : 'Desactivada'}
              </span>
            </label>
          </div>
        </div>

        <div className="viewer-content">
          <div className="viewer-header">
            <Eye size={24} />
            <h3>Modo Markdown Preview</h3>
          </div>
        </div>
      </div>
    );
  }

  if (enabledModels.length === 0) {
    return (
      <div className="ai-panel">
        <div className="ai-toggle-section">
          <div className="ai-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isAIEnabled}
                onChange={(e) => setIsAIEnabled(e.target.checked)}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                <Power size={16} />
                IA {isAIEnabled ? 'Activada' : 'Desactivada'}
              </span>
            </label>
          </div>
        </div>

        <div className="panel-header">
          <Sparkles size={18} />
          <span>IA Vitaminada</span>
        </div>
        <div className="no-models">
          <AlertCircle size={24} />
          <p>No hay modelos habilitados. Configura los modelos en tu archivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-panel">
      {/* Toggle de IA */}
      <div className="ai-toggle-section">
        <div className="ai-toggle">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={isAIEnabled}
              onChange={(e) => setIsAIEnabled(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">
              <Power size={16} />
              IA {isAIEnabled ? 'Activada' : 'Desactivada'}
            </span>
          </label>
        </div>
      </div>

      {/* Contador de tokens */}
      <div className="tokens-counter">
        <div className="tokens-stats">
          <div className="tokens-total">
            <span className="tokens-label">Total:</span>
            <span className="tokens-value">{tokensConsumed.totalTokens.toLocaleString()}</span>
          </div>
          <div className="tokens-breakdown">
            <span className="tokens-input">
              ↗ {tokensConsumed.totalInput.toLocaleString()} entrada
            </span>
            <span className="tokens-output">
              ↙ {tokensConsumed.totalOutput.toLocaleString()} salida
            </span>
          </div>
          {tokensConsumed.lastRequest && (
            <div className="tokens-last">
              <span className="tokens-last-label">Última:</span>
              <span className="tokens-last-value">
                {tokensConsumed.lastRequest.total.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="panel-header">
        <Sparkles size={18} />
        <span>IA Vitaminada</span>
        {selectedText && (
          <span className="selection-indicator">
            Texto seleccionado
          </span>
        )}
      </div>

      <div className="panel-content">
        <div className="model-selection">
          <label htmlFor="model-select">Modelo:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="model-select"
            disabled={isLoading}
          >
            {enabledModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.isFree && '(Gratis)'}
              </option>
            ))}
          </select>
          
          {selectedModel && (
            <div className="model-info">
              {(() => {
                const model = enabledModels.find(m => m.id === selectedModel);
                return (
                  <div className="model-details">
                     <div className="model-provider">
                       {model?.isFree ? (
                         <Zap size={14} className="free-icon" />
                       ) : (
                         <Crown size={14} className="premium-icon" />
                       )}
                       <span>{model?.provider}</span>
                       <span className="model-tokens">
                         • {model?.contextTokens?.toLocaleString()} contexto 
                         • {model?.maxTokens?.toLocaleString()} salida
                       </span>
                       <a
                         href={`https://openrouter.ai/${model?.id}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="model-link"
                         title="Ver información completa del modelo en OpenRouter"
                       >
                         <ExternalLink size={12} />
                       </a>
                     </div>
                     <p className="model-description">{model?.description}</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        <div className="prompt-section">
          <label htmlFor="prompt-input">
            Prompt personalizado (opcional):
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe cómo quieres mejorar el texto..."
            className="prompt-input"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="quick-prompts">
          <label>Prompts rápidos:</label>
          <div className="quick-prompts-grid">
            {quickPrompts.map((quickPrompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(quickPrompt)}
                className="quick-prompt-button"
                disabled={isLoading}
              >
                {quickPrompt}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleImprove}
          disabled={isLoading || !selectedModel}
          className="improve-button"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="spinning" />
              <span>Mejorando...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>
                {selectedText ? 'Mejorar selección' : 'Mejorar documento'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIPanel; 