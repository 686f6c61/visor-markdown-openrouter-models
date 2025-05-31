import axios from 'axios';
import { getModelById } from '../config/models';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || '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';
    
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Please set REACT_APP_OPENROUTER_API_KEY in your environment variables.');
    }
  }

  async improveMarkdown(markdown, prompt, modelId, selectedText = null) {
    if (!this.apiKey) {
      throw new Error('API key no configurada. Por favor, configura REACT_APP_OPENROUTER_API_KEY en tu archivo .env');
    }

    const textToImprove = selectedText || markdown;
    const isPartialImprovement = selectedText !== null;
    const model = getModelById(modelId);
    const maxTokens = model ? model.maxTokens : 4000;

    const systemPrompt = isPartialImprovement 
      ? `Eres un experto en escritura y markdown. Mejora SOLO el texto seleccionado manteniendo el formato markdown. Devuelve únicamente el texto mejorado sin explicaciones adicionales.`
      : `Eres un experto en escritura y markdown. Mejora el documento completo manteniendo la estructura y formato markdown. Devuelve únicamente el markdown mejorado sin explicaciones adicionales.`;

    const userPrompt = prompt 
      ? `${prompt}\n\nTexto a mejorar:\n${textToImprove}`
      : `Mejora este ${isPartialImprovement ? 'texto' : 'documento markdown'} haciéndolo más claro, coherente y bien estructurado:\n\n${textToImprove}`;

    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: modelId,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Markdown Preview - Visor Markdown Vitaminado'
          }
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('Respuesta inválida del modelo');
      }
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      
      if (error.response?.status === 401) {
        throw new Error('API key inválida. Verifica tu configuración.');
      } else if (error.response?.status === 429) {
        throw new Error('Límite de rate excedido. Intenta de nuevo en unos momentos.');
      } else if (error.response?.status === 402) {
        throw new Error('Créditos insuficientes en tu cuenta de OpenRouter.');
      } else {
        throw new Error(`Error al mejorar el markdown: ${error.message}`);
      }
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      return { success: false, error: 'API key no configurada' };
    }

    try {
      await axios.post(
        OPENROUTER_API_URL,
        {
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Markdown Preview - Test Connection'
          }
        }
      );

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }
}

const openRouterService = new OpenRouterService();
export default openRouterService; 