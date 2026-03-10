import type { Model } from './types';

export const MODELS: Model[] = [
  // Free models
  { id: 'stepfun/step-3.5-flash:free', name: 'StepFun: Step 3.5 Flash (free)', description: 'Fast and free model by StepFun', contextWindow: '32K', provider: 'StepFun' },
  { id: 'meta-llama/llama-4-maverick:free', name: 'Llama 4 Maverick (free)', description: 'Meta\'s latest open-source model', contextWindow: '256K', provider: 'Meta' },
  { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek V3 (free)', description: 'DeepSeek\'s powerful chat model', contextWindow: '128K', provider: 'DeepSeek' },
  { id: 'qwen/qwen3-235b-a22b:free', name: 'Qwen3 235B (free)', description: 'Alibaba\'s largest open model', contextWindow: '32K', provider: 'Qwen' },
  { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: 'Mistral Small 3.1 (free)', description: 'Mistral\'s efficient small model', contextWindow: '96K', provider: 'Mistral' },
  // Premium models (require API key)
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Google\'s fast multimodal model', contextWindow: '1M', provider: 'Google' },
  { id: 'google/gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro', description: 'Google\'s most capable model', contextWindow: '1M', provider: 'Google' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic\'s balanced model', contextWindow: '200K', provider: 'Anthropic' },
  { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', description: 'Anthropic\'s latest Sonnet', contextWindow: '200K', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'OpenAI\'s flagship model', contextWindow: '128K', provider: 'OpenAI' },
  { id: 'openai/gpt-4.1', name: 'GPT-4.1', description: 'OpenAI\'s latest GPT model', contextWindow: '1M', provider: 'OpenAI' },
  { id: 'openai/o3-mini', name: 'o3-mini', description: 'OpenAI\'s reasoning model', contextWindow: '200K', provider: 'OpenAI' },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', description: 'DeepSeek\'s reasoning model', contextWindow: '128K', provider: 'DeepSeek' },
  { id: 'x-ai/grok-3-mini', name: 'Grok 3 Mini', description: 'xAI\'s efficient reasoning model', contextWindow: '128K', provider: 'xAI' },
];
