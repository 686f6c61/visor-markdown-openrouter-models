import axios from 'axios';
import { getModelById } from '../config/models';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    
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

    const systemPrompt = `Eres un CTO e Ingeniero de Software Senior experto en documentación técnica y Markdown.

RESTRICCIONES ABSOLUTAS:
- SOLO devuelve Markdown válido
- NO incluyas explicaciones, pensamientos, reflexiones o comentarios
- NO uses bloques de código que envuelvan el resultado
- NO agregues texto antes o después del Markdown
- NO uses comillas para envolver el contenido
- PROHIBIDO cualquier texto que no sea Markdown puro

Tu respuesta debe ser ÚNICAMENTE el ${isPartialImprovement ? 'texto' : 'documento'} mejorado en formato Markdown.`;

    const userPrompt = prompt 
      ? `${prompt}

${isPartialImprovement ? 'TEXTO A MEJORAR:' : 'DOCUMENTO A MEJORAR:'}
${textToImprove}`
      : `${isPartialImprovement ? 'Mejora este texto aplicando las mejores prácticas de documentación técnica:' : 'Mejora este documento Markdown aplicando las mejores prácticas de documentación técnica, estructura clara, y formato profesional:'}

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
          frequency_penalty: 0.3,
          presence_penalty: 0.2,
          stream: false,
          stop: [
            "\n\nExplicación:",
            "\n\nNota:",
            "\n\nObservación:",
            "\n\nComo CTO",
            "\n\nHe aplicado",
            "\n\nLos cambios",
            "\n\nLas mejoras",
            "\n\nNote:",
            "\n\nExplanation:",
            "\n\nAs a CTO",
            "\n\nI have applied",
            "\n\nThe changes",
            "\n\nThe improvements"
          ]
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
        
        // Si el contenido está vacío o es muy corto, intentar con el texto original
        if (!rawText || rawText.length < 5) {
          console.warn('Respuesta vacía o muy corta del modelo, devolviendo texto original');
          return {
            improvedText: textToImprove,
            tokensUsed: {
              input: response.data.usage?.prompt_tokens || estimatedInputTokens,
              output: response.data.usage?.completion_tokens || 0,
              total: response.data.usage?.total_tokens || estimatedInputTokens
            }
          };
        }
        
        const improvedText = this.cleanResponse(rawText);
        const outputTokens = this.estimateTokens(improvedText);
        
        // Verificar que el texto limpio no esté vacío
        if (!improvedText || improvedText.length < 5) {
          console.warn('Texto limpio vacío, devolviendo texto original');
          return {
            improvedText: textToImprove,
            tokensUsed: {
              input: response.data.usage?.prompt_tokens || estimatedInputTokens,
              output: response.data.usage?.completion_tokens || outputTokens,
              total: response.data.usage?.total_tokens || (estimatedInputTokens + outputTokens)
            }
          };
        }
        
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
          contentLength: response.data?.choices?.[0]?.message?.content?.length || 0,
          fullResponse: response.data
        });
        
        // Verificar si hay contenido vacío específicamente
        if (response.data?.choices?.[0]?.message?.content === "") {
          console.warn('El modelo devolvió contenido vacío, usando texto original');
          return {
            improvedText: textToImprove,
            tokensUsed: {
              input: response.data.usage?.prompt_tokens || estimatedInputTokens,
              output: response.data.usage?.completion_tokens || 0,
              total: response.data.usage?.total_tokens || estimatedInputTokens
            }
          };
        }
        
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
            improvedText: improvedText || textToImprove,
            tokensUsed: {
              input: response.data.usage?.prompt_tokens || estimatedInputTokens,
              output: response.data.usage?.completion_tokens || outputTokens,
              total: response.data.usage?.total_tokens || (estimatedInputTokens + outputTokens)
            }
          };
        }
        
        // Si no hay contenido válido, devolver el texto original
        console.warn('No se encontró contenido válido, devolviendo texto original');
        return {
          improvedText: textToImprove,
          tokensUsed: {
            input: response.data.usage?.prompt_tokens || estimatedInputTokens,
            output: response.data.usage?.completion_tokens || 0,
            total: response.data.usage?.total_tokens || estimatedInputTokens
          }
        };
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
    let cleanedText = text.trim();
    
    // Remover bloques de código que envuelven todo el contenido PRIMERO
    if (cleanedText.startsWith('```markdown') && cleanedText.endsWith('```')) {
      const lines = cleanedText.split('\n');
      if (lines.length > 2) {
        cleanedText = lines.slice(1, -1).join('\n').trim();
      }
    } else if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
      const lines = cleanedText.split('\n');
      if (lines.length > 2) {
        cleanedText = lines.slice(1, -1).join('\n').trim();
      }
    }
    
    // Remover comillas que envuelven todo el contenido
    if (cleanedText.startsWith('"') && cleanedText.endsWith('"')) {
      cleanedText = cleanedText.slice(1, -1).trim();
    }
    
    // Patrones más agresivos para detectar líneas de explicación que deben eliminarse
    const unwantedPatterns = [
      // Español
      /^(Aquí tienes|He mejorado|A continuación|Aquí está|Te presento|Esta es|Versión mejorada|Texto mejorado|Contenido mejorado|El resultado es|La mejora es|Como CTO|Como ingeniero|Desde mi experiencia|Mi recomendación|La versión optimizada|El documento mejorado)/i,
      /^(Basándome en|Considerando|Teniendo en cuenta|Aplicando|Implementando|Optimizando|Mejorando|Reestructurando|Refinando|Puliendo)/i,
      /^(He aplicado|He implementado|He optimizado|He mejorado|He reestructurado|He refinado|He pulido|Se ha aplicado|Se ha implementado)/i,
      /^(Los cambios incluyen|Las mejoras son|Los ajustes realizados|Las modificaciones|Las optimizaciones)/i,
      /^(Con estas mejoras|Estas modificaciones|Estos cambios|Esta optimización|Esta reestructuración)/i,
      
      // Inglés
      /^(Here's|Here is|This is|Improved version|Enhanced text|The result is|The improvement is|As a CTO|As an engineer|From my experience|My recommendation|The optimized version|The improved document)/i,
      /^(Based on|Considering|Taking into account|Applying|Implementing|Optimizing|Improving|Restructuring|Refining|Polishing)/i,
      /^(I have applied|I have implemented|I have optimized|I have improved|I have restructured|I have refined|I have polished|Applied|Implemented)/i,
      /^(The changes include|The improvements are|The adjustments made|The modifications|The optimizations)/i,
      /^(With these improvements|These modifications|These changes|This optimization|This restructuring)/i,
      
      // Patrones generales de explicación
      /^.*?(I need to|Let me|I'll|I can|I will|I should|We need to|Let's|The user|The text|This text|The original|The improved|Following|Based on|According to|As requested|To improve|In order to|For better|To make|The goal|My task|The task|I've|I have|Looking at|Analyzing|Reviewing|Examining|Considering).*$/i,
      /^.*?(meaning|which means|So we need to|The user says|I need to produce|Following|Additionally|Furthermore|Moreover|Also|However|Nevertheless|Therefore|Thus|Hence|Consequently|As a result|In conclusion|To summarize|In summary|Overall|Finally).*$/i,
      
      // Líneas que contienen solo explicaciones sin contenido markdown
      /^[^#*\-[\]`|>]*?(explicación|explanation|note|nota|observación|observation|comentario|comment|aclaración|clarification).*$/i,
      /^[^#*\-[\]`|>]*?(he realizado|I have made|se han aplicado|have been applied|los cambios|the changes|las mejoras|the improvements).*$/i
    ];

    // Dividir en líneas y procesar
    const lines = cleanedText.split('\n');
    const cleanLines = [];
    let foundMarkdownContent = false;
    let skipIntroLines = true;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Saltar líneas vacías al inicio
      if (skipIntroLines && trimmedLine.length === 0) continue;
      
      // Verificar si la línea es una explicación no deseada
      let isUnwantedLine = false;
      for (const pattern of unwantedPatterns) {
        if (pattern.test(trimmedLine)) {
          isUnwantedLine = true;
          break;
        }
      }
      
      // Si es una línea no deseada, saltarla
      if (isUnwantedLine) continue;
      
      // Detectar contenido markdown válido
      const isMarkdownContent = (
        trimmedLine.startsWith('#') ||           // Encabezados
        trimmedLine.startsWith('*') ||           // Listas o énfasis
        trimmedLine.startsWith('-') ||           // Listas
        trimmedLine.startsWith('+') ||           // Listas
        /^\d+\./.test(trimmedLine) ||            // Listas numeradas
        trimmedLine.startsWith('```') ||         // Bloques de código
        trimmedLine.startsWith('|') ||           // Tablas
        trimmedLine.startsWith('>') ||           // Citas
        trimmedLine.includes('**') ||            // Texto en negrita
        trimmedLine.includes('__') ||            // Texto en negrita alternativo
        trimmedLine.includes('[') ||             // Enlaces o referencias
        trimmedLine.includes('![') ||            // Imágenes
        trimmedLine.includes('`') ||             // Código inline
        (trimmedLine.length > 15 && !isUnwantedLine) // Párrafos largos que no son explicaciones
      );
      
      // Si encontramos contenido markdown, empezar a incluir todo
      if (isMarkdownContent) {
        foundMarkdownContent = true;
        skipIntroLines = false;
      }
      
      // Si ya encontramos contenido markdown o es una línea vacía después del contenido, incluir
      if (foundMarkdownContent || (!skipIntroLines && trimmedLine.length === 0)) {
        cleanLines.push(line); // Mantener espacios originales
      }
    }
    
    cleanedText = cleanLines.join('\n').trim();
    
    // Verificación final: si no hay contenido markdown válido, intentar extraer cualquier texto útil
    if (!cleanedText || cleanedText.length < 10) {
      // Buscar cualquier línea que no sea explicativa
      const fallbackLines = [];
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
          let isExplanation = false;
          for (const pattern of unwantedPatterns) {
            if (pattern.test(trimmedLine)) {
              isExplanation = true;
              break;
            }
          }
          if (!isExplanation) {
            fallbackLines.push(line);
          }
        }
      }
      
      if (fallbackLines.length > 0) {
        cleanedText = fallbackLines.join('\n').trim();
      } else {
        // Como último recurso, devolver el texto original limpio
        return text.trim();
      }
    }
    
    return cleanedText;
  }
}

const openRouterService = new OpenRouterService();
export default openRouterService; 