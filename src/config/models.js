export const MODELS = [
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_DEEPSEEK_R1 === 'true',
    description: 'Modelo gratuito de DeepSeek para razonamiento',
    maxTokens: 65536
  },
  {
    id: 'qwen/qwen3-30b-a3b:free',
    name: 'Qwen3 30B',
    provider: 'Qwen',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_QWEN3_30B === 'true',
    description: 'Modelo gratuito de Qwen con 30B parámetros',
    maxTokens: 32768
  },
  {
    id: 'meta-llama/llama-4-maverick:free',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_LLAMA_4_MAVERICK === 'true',
    description: 'Modelo gratuito de Meta Llama 4',
    maxTokens: 131072
  },
  {
    id: 'google/gemma-3n-e4b-it:free',
    name: 'Gemma 3N E4B IT',
    provider: 'Google',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_GEMMA_3N === 'true',
    description: 'Modelo gratuito de Google Gemma optimizado para instrucciones',
    maxTokens: 8192
  },
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Llama 3.3 8B Instruct',
    provider: 'Meta',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_LLAMA_33_8B === 'true',
    description: 'Modelo gratuito Llama 3.3 optimizado para instrucciones',
    maxTokens: 128000
  },
  {
    id: 'nousresearch/deephermes-3-mistral-24b-preview:free',
    name: 'DeepHermes 3 Mistral 24B',
    provider: 'Nous Research',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_DEEPHERMES_3 === 'true',
    description: 'Modelo gratuito DeepHermes basado en Mistral',
    maxTokens: 32768
  },
  {
    id: 'microsoft/phi-4-reasoning-plus:free',
    name: 'Phi-4 Reasoning Plus',
    provider: 'Microsoft',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_PHI_4 === 'true',
    description: 'Modelo gratuito de Microsoft para razonamiento avanzado',
    maxTokens: 32768
  },
  {
    id: 'deepseek/deepseek-prover-v2:free',
    name: 'DeepSeek Prover V2',
    provider: 'DeepSeek',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_DEEPSEEK_PROVER === 'true',
    description: 'Modelo gratuito DeepSeek especializado en pruebas',
    maxTokens: 65536
  },
  {
    id: 'nvidia/llama-3.3-nemotron-super-49b-v1:free',
    name: 'Llama 3.3 Nemotron Super 49B',
    provider: 'NVIDIA',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_NEMOTRON_49B === 'true',
    description: 'Modelo gratuito NVIDIA Nemotron de alta capacidad',
    maxTokens: 131072
  },
  {
    id: 'deepseek/deepseek-r1-zero:free',
    name: 'DeepSeek R1 Zero',
    provider: 'DeepSeek',
    isFree: true,
    enabled: process.env.REACT_APP_ENABLE_DEEPSEEK_R1_ZERO === 'true',
    description: 'Modelo gratuito DeepSeek R1 versión Zero',
    maxTokens: 65536
  }
];

export const getEnabledModels = () => {
  return MODELS.filter(model => model.enabled);
};

export const getModelById = (id) => {
  return MODELS.find(model => model.id === id);
}; 