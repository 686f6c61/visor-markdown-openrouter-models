const models = [
  {
    id: 'google/gemma-3-4b-it',
    name: 'Gemma 3 4B Instruct',
    provider: 'Google',
    description: 'Multimodal model supporting vision-language input and text outputs. Handles context windows up to 96k tokens, understands over 140 languages, and offers improved math, reasoning, and chat capabilities.',
    contextTokens: 96000,
    maxTokens: 8192,
    isFree: false
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'OpenAI\'s most advanced small model, supporting both text and image inputs. More than 60% cheaper than GPT-3.5 Turbo while maintaining SOTA intelligence.',
    contextTokens: 128000,
    maxTokens: 16384,
    isFree: false
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Significantly faster time to first token compared to Gemini Flash 1.5, with notable enhancements in multimodal understanding, coding capabilities, and function calling.',
    contextTokens: 1048576,
    maxTokens: 8192,
    isFree: false
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324',
    name: 'DeepSeek V3 0324',
    provider: 'DeepSeek',
    description: '685B-parameter mixture-of-experts model, latest iteration of the flagship chat model family. Performs really well on a variety of tasks.',
    contextTokens: 163840,
    maxTokens: 8192,
    isFree: false
  },
  {
    id: 'mistralai/mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'Mistral',
    description: '12B parameter model with 128k token context length. Multilingual support for 11 languages including English, French, German, Spanish, and more. Supports function calling.',
    contextTokens: 131072,
    maxTokens: 4096,
    isFree: false
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    description: 'High-capacity multimodal language model with mixture-of-experts architecture. 17B active parameters, supports multilingual text and image input with 1M token context window.',
    contextTokens: 1048576,
    maxTokens: 8192,
    isFree: false
  }
];

// Función para obtener modelos habilitados basándose en las variables de entorno
export const getEnabledModels = () => {
  return models.filter(model => {
    const envKey = `REACT_APP_${model.id.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_ENABLED`;
    return process.env[envKey] === 'true';
  });
};

// Función para obtener un modelo por ID
export const getModelById = (id) => {
  return models.find(model => model.id === id);
};

export default models; 