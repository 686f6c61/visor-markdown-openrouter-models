import axios from 'axios';
import { getModelById } from '../config/models';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY || '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';
    
    console.log('API Key configurada:', this.apiKey ? 'Sí' : 'No');
    console.log('API Key desde env:', process.env.REACT_APP_OPENROUTER_API_KEY ? 'Sí' : 'No');
    
    if (!this.apiKey) {
      console.warn('OpenRouter API key not found. Please set REACT_APP_OPENROUTER_API_KEY in your environment variables.');
    }
  }

  // Función para estimar tokens (aproximadamente 4 caracteres = 1 token)
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  // Función para calcular tokens de salida seguros
  calculateSafeOutputTokens(inputText, modelId) {
    const model = getModelById(modelId);
    if (!model) return 4000;

    const inputTokens = this.estimateTokens(inputText);
    const maxOutputTokens = model.maxTokens;
    const maxContext = model.contextTokens || 32000; // Usar contextTokens del modelo
    
    // Reservar espacio para tokens del sistema y margen de seguridad
    const systemTokens = 200; // Estimación para prompts del sistema
    const safetyMargin = 1000; // Margen de seguridad
    
    const availableTokens = maxContext - inputTokens - systemTokens - safetyMargin;
    const safeOutputTokens = Math.min(maxOutputTokens, Math.max(1000, availableTokens));
    
    console.log(`Modelo: ${modelId}`);
    console.log(`Tokens de entrada estimados: ${inputTokens}`);
    console.log(`Contexto máximo: ${maxContext}`);
    console.log(`Tokens de salida configurados: ${maxOutputTokens}`);
    console.log(`Tokens de salida seguros calculados: ${safeOutputTokens}`);
    
    return safeOutputTokens;
  }

  async improveMarkdown(markdown, prompt, modelId, selectedText = null) {
    if (!this.apiKey) {
      throw new Error('API key no configurada. Por favor, configura REACT_APP_OPENROUTER_API_KEY en tu archivo .env');
    }

    console.log('=== INICIO DE SOLICITUD ===');
    console.log('Modelo seleccionado:', modelId);
    console.log('Prompt personalizado:', prompt || 'Sin prompt personalizado');
    console.log('Texto seleccionado:', selectedText ? 'Sí' : 'No (documento completo)');

    const textToImprove = selectedText || markdown;
    const isPartialImprovement = selectedText !== null;

    console.log('Longitud del texto a mejorar:', textToImprove.length, 'caracteres');

    const systemPrompt = isPartialImprovement 
      ? `INSTRUCCIONES CRÍTICAS - CUMPLE EXACTAMENTE:
1. Devuelve ÚNICAMENTE el texto mejorado
2. NO escribas explicaciones, introducciones o comentarios
3. NO muestres tu proceso de pensamiento
4. NO uses frases como "Aquí tienes", "He mejorado", "User asks", "I need to", "Let me", "I'll"
5. Mantén el formato markdown original
6. Responde SOLO con el contenido mejorado

TEXTO A MEJORAR:`
      : `INSTRUCCIONES CRÍTICAS - CUMPLE EXACTAMENTE:
1. Devuelve ÚNICAMENTE el documento markdown mejorado
2. NO escribas explicaciones, introducciones o comentarios
3. NO muestres tu proceso de pensamiento
4. NO uses frases como "Aquí tienes", "He mejorado", "User asks", "I need to", "Let me", "I'll"
5. Mantén la estructura markdown original
6. Responde SOLO con el markdown mejorado

DOCUMENTO A MEJORAR:`;

    const userPrompt = prompt 
      ? `${prompt}

${textToImprove}`
      : `Mejora este ${isPartialImprovement ? 'texto' : 'documento'}:

${textToImprove}`;

    // Calcular tokens de salida seguros
    const fullPrompt = systemPrompt + '\n' + userPrompt;
    const safeMaxTokens = this.calculateSafeOutputTokens(fullPrompt, modelId);
    const estimatedInputTokens = this.estimateTokens(fullPrompt);

    console.log('Tokens de salida máximos configurados:', safeMaxTokens);

    try {
      console.log('Enviando solicitud a OpenRouter...');
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
          temperature: 0.1,
          max_tokens: safeMaxTokens,
          top_p: 0.8,
          frequency_penalty: 0.2,
          presence_penalty: 0.2,
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

      console.log('Respuesta recibida. Status:', response.status);
      console.log('Estructura de respuesta:', {
        hasData: !!response.data,
        hasChoices: !!response.data?.choices,
        choicesLength: response.data?.choices?.length
      });

      if (response.data?.choices?.[0]?.message?.content) {
        const rawText = response.data.choices[0].message.content.trim();
        const improvedText = this.cleanResponse(rawText);
        const outputTokens = this.estimateTokens(improvedText);
        
        // Retornar tanto el texto mejorado como la información de tokens
        return {
          improvedText,
          tokensUsed: {
            input: response.data.usage?.prompt_tokens || estimatedInputTokens,
            output: response.data.usage?.completion_tokens || outputTokens,
            total: response.data.usage?.total_tokens || (estimatedInputTokens + outputTokens)
          }
        };
      } else {
        // Log detallado para diagnosticar el problema
        console.error('Estructura de respuesta inesperada:', {
          hasData: !!response.data,
          hasChoices: !!response.data?.choices,
          choicesLength: response.data?.choices?.length,
          firstChoice: response.data?.choices?.[0],
          hasMessage: !!response.data?.choices?.[0]?.message,
          hasContent: !!response.data?.choices?.[0]?.message?.content,
          fullResponse: response.data
        });
        
        // Intentar extraer cualquier contenido disponible
        const content = response.data?.choices?.[0]?.message?.content || 
                       response.data?.choices?.[0]?.text ||
                       response.data?.content ||
                       response.data?.text;
        
        if (content && typeof content === 'string' && content.trim()) {
          console.log('Contenido encontrado en formato alternativo:', content);
          const rawText = content.trim();
          const improvedText = this.cleanResponse(rawText);
          const outputTokens = this.estimateTokens(improvedText);
          
          return {
            improvedText,
            tokensUsed: {
              input: response.data.usage?.prompt_tokens || estimatedInputTokens,
              output: response.data.usage?.completion_tokens || outputTokens,
              total: response.data.usage?.total_tokens || (estimatedInputTokens + outputTokens)
            }
          };
        }
        
        throw new Error(`Respuesta inválida del modelo. Estructura recibida: ${JSON.stringify(response.data, null, 2)}`);
      }
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        throw new Error('API key inválida. Verifica tu configuración en OpenRouter.');
      } else if (error.response?.status === 429) {
        throw new Error('Límite de rate excedido. Intenta de nuevo en unos momentos.');
      } else if (error.response?.status === 402) {
        throw new Error('Créditos insuficientes en tu cuenta de OpenRouter.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error?.message || 'Solicitud inválida';
        if (errorMsg.includes('context length') || errorMsg.includes('tokens')) {
          throw new Error(`El texto es demasiado largo para este modelo. Intenta con un texto más corto o selecciona solo una parte del documento.`);
        }
        throw new Error(`Error en la solicitud: ${errorMsg}`);
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        const errorMsg = error.response?.data?.error?.message || error.message;
        throw new Error(`Error al mejorar el markdown: ${errorMsg}`);
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

  // Función para limpiar respuestas verbosas
  cleanResponse(text) {
    // Remover frases introductorias comunes
    const introPatterns = [
      /^(Aquí tienes|He mejorado|A continuación|Aquí está|Te presento|Esta es|Versión mejorada|Texto mejorado|Contenido mejorado)[:\s]*/i,
      /^(Here's|Here is|This is|Improved version|Enhanced text)[:\s]*/i,
      /^User asks:.*$/im,
      /^We are asked:.*$/im,
      /^.*?I need to.*?$/im,
      /^.*?Let me.*?$/im,
      /^.*?I'll.*?$/im,
      /^.*?I can.*?$/im,
      /^.*?meaning.*?in Spanish.*?$/im,
      /^.*?which means.*?$/im,
      /^.*?So we need to.*?$/im,
      /^.*?The user says.*?$/im,
      /^.*?I need to produce.*?$/im,
      /^.*?We need to.*?$/im
    ];

    let cleanedText = text.trim();
    
    // Aplicar patrones de limpieza línea por línea
    const lines = cleanedText.split('\n');
    let startIndex = 0;
    
    // Encontrar donde empieza el contenido real (saltar explicaciones iniciales)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length === 0) continue;
      
      let isIntroLine = false;
      for (const pattern of introPatterns) {
        if (pattern.test(line)) {
          isIntroLine = true;
          break;
        }
      }
      
      if (!isIntroLine && (line.startsWith('#') || line.length > 10)) {
        startIndex = i;
        break;
      }
    }
    
    // Tomar solo las líneas del contenido real
    cleanedText = lines.slice(startIndex).join('\n').trim();

    // Si el texto empieza con comillas, removerlas
    if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
      cleanedText = cleanedText.slice(1, -1).trim();
    }

    // Si el texto empieza con markdown code block, removerlo
    if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
      const lines = cleanedText.split('\n');
      cleanedText = lines.slice(1, -1).join('\n').trim();
    }

    return cleanedText || text.trim();
  }
}

const openRouterService = new OpenRouterService();
export default openRouterService; 