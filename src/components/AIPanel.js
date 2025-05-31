import React, { useState } from 'react';
import { Sparkles, Send, Loader2, AlertCircle, Crown, Zap, ExternalLink } from 'lucide-react';
import { getEnabledModels } from '../config/models';
import './AIPanel.css';

const AIPanel = ({ onImprove, selectedText, isLoading, tokensConsumed }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  
  const enabledModels = getEnabledModels();

  React.useEffect(() => {
    if (enabledModels.length > 0 && !selectedModel) {
      // Buscar DeepSeek Prover V2 como modelo predeterminado
      const deepseekV2 = enabledModels.find(model => 
        model.id === 'deepseek/deepseek-prover-v2:free'
      );
      
      // Si encontramos DeepSeek V2, lo seleccionamos, sino el primero disponible
      setSelectedModel(deepseekV2 ? deepseekV2.id : enabledModels[0].id);
    }
  }, [enabledModels, selectedModel]);

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
    'Mejora la claridad y estructura del texto',
    'Corrige errores gramaticales y de estilo',
    'Añade más detalles y ejemplos',
    'Simplifica el lenguaje para mejor comprensión',
    'Mejora el formato y organización',
    'Convierte en formato profesional con tabla de contenidos y secciones bien definidas'
  ];

  if (enabledModels.length === 0) {
    return (
      <div className="ai-panel">
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