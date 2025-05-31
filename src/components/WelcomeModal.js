import React, { useState } from 'react';
import { X, Sparkles, Target, Brain, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { getEnabledModels } from '../config/models';
import './WelcomeModal.css';

const WelcomeModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const enabledModels = getEnabledModels();

  const steps = [
    {
      title: "¡Bienvenido al Visor Markdown Vitaminado! 🚀",
      content: (
        <div className="welcome-intro">
          <div className="intro-hero">
            <Sparkles size={48} className="intro-icon" />
            <h3>El editor de Markdown más potente con IA integrada</h3>
            <p>Transforma tus documentos con inteligencia artificial mientras escribes</p>
          </div>
          
          <div className="intro-features">
            <div className="feature-item">
              <CheckCircle size={20} className="feature-check" />
              <span>10 modelos de IA completamente gratuitos</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={20} className="feature-check" />
              <span>Vista previa en tiempo real</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={20} className="feature-check" />
              <span>Mejora selectiva de texto</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={20} className="feature-check" />
              <span>Historial de cambios</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🎯 Mejora Selectiva: El Poder Está en Tus Manos",
      content: (
        <div className="selective-improvement">
          <div className="improvement-demo">
            <Target size={40} className="demo-icon" />
            <h3>¿Cómo funciona la mejora selectiva?</h3>
          </div>
          
          <div className="improvement-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Selecciona el texto</h4>
                <p>Resalta cualquier párrafo, frase o sección que quieras mejorar</p>
                <div className="example-text">
                  <span className="selected-text">Este texto está seleccionado</span>
                  <span> y será el único que mejore la IA</span>
                </div>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Elige tu modelo de IA</h4>
                <p>Selecciona entre 10 modelos especializados según tus necesidades</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>¡Mejora instantánea!</h4>
                <p>La IA procesará solo el texto seleccionado, manteniendo el resto intacto</p>
              </div>
            </div>
          </div>
          
          <div className="improvement-tip">
            <div className="tip-icon">💡</div>
            <div className="tip-text">
              <strong>Tip:</strong> Si no seleccionas texto, la IA mejorará todo el documento
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🤖 Modelos de IA Disponibles (¡Todos Gratuitos!)",
      content: (
        <div className="models-showcase">
          <div className="models-header">
            <Brain size={40} className="models-icon" />
            <h3>10 Modelos Especializados a Tu Disposición</h3>
            <p>Cada modelo tiene fortalezas únicas para diferentes tipos de contenido</p>
          </div>
          
          <div className="models-table">
            <div className="table-header">
              <div className="col-model">Modelo</div>
              <div className="col-provider">Proveedor</div>
              <div className="col-tokens">Tokens</div>
              <div className="col-specialty">Especialidad</div>
            </div>
            
            {enabledModels.slice(0, 6).map((model, index) => (
              <div key={model.id} className="table-row">
                <div className="col-model">
                  <Zap size={14} className="free-badge" />
                  <span className="model-name">{model.name}</span>
                </div>
                <div className="col-provider">{model.provider}</div>
                <div className="col-tokens">{model.maxTokens?.toLocaleString()}</div>
                <div className="col-specialty">
                  {index === 0 && "Razonamiento avanzado"}
                  {index === 1 && "Uso general"}
                  {index === 2 && "Conversación natural"}
                  {index === 3 && "Instrucciones precisas"}
                  {index === 4 && "Respuestas rápidas"}
                  {index === 5 && "Razonamiento profundo"}
                </div>
              </div>
            ))}
            
            {enabledModels.length > 6 && (
              <div className="more-models">
                <span>+ {enabledModels.length - 6} modelos más disponibles</span>
              </div>
            )}
          </div>
          
          <div className="models-tip">
            <Zap size={16} className="tip-icon" />
            <span>Todos los modelos son 100% gratuitos gracias a OpenRouter</span>
          </div>
        </div>
      )
    },
    {
      title: "🚀 ¡Comienza a Crear Contenido Increíble!",
      content: (
        <div className="getting-started">
          <div className="start-hero">
            <div className="start-icon">🎉</div>
            <h3>¡Ya estás listo para comenzar!</h3>
            <p>Tu documento README ya está cargado como ejemplo</p>
          </div>
          
          <div className="quick-actions">
            <h4>Acciones rápidas para empezar:</h4>
            
            <div className="action-item">
              <div className="action-icon">✏️</div>
              <div className="action-text">
                <strong>Edita el contenido:</strong> Modifica el texto o carga tu propio archivo
              </div>
            </div>
            
            <div className="action-item">
              <div className="action-icon">🎯</div>
              <div className="action-text">
                <strong>Selecciona y mejora:</strong> Resalta cualquier texto y usa la IA
              </div>
            </div>
            
            <div className="action-item">
              <div className="action-icon">🤖</div>
              <div className="action-text">
                <strong>Experimenta con modelos:</strong> Prueba diferentes IAs para distintos estilos
              </div>
            </div>
            
            <div className="action-item">
              <div className="action-icon">📋</div>
              <div className="action-text">
                <strong>Copia y comparte:</strong> Usa los botones para copiar tu contenido mejorado
              </div>
            </div>
          </div>
          
          <div className="start-footer">
            <div className="footer-text">
              ¿Necesitas ayuda? Toda la documentación está en el README cargado
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem('welcomeModalSeen', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal">
        <div className="modal-header">
          <div className="step-indicator">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          <button onClick={handleClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <h2 className="step-title">{steps[currentStep].title}</h2>
          <div className="step-content">
            {steps[currentStep].content}
          </div>
        </div>

        <div className="modal-footer">
          <div className="step-counter">
            {currentStep + 1} de {steps.length}
          </div>
          
          <div className="navigation-buttons">
            {currentStep > 0 && (
              <button onClick={prevStep} className="nav-button prev-button">
                Anterior
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button onClick={nextStep} className="nav-button next-button">
                Siguiente
                <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleClose} className="nav-button finish-button">
                ¡Empezar a crear!
                <Sparkles size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal; 