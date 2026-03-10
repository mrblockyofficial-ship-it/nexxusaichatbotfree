import type { Model } from './types';

export const MODELS: Model[] = [
  { id: 'stepfun/step-3.5-flash:free', name: 'StepFun: Step 3.5 Flash (free)', description: 'Fast and free model by StepFun', contextWindow: '32K', provider: 'StepFun' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Google\'s fast multimodal model', contextWindow: '1M', provider: 'Google' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Anthropic\'s balanced model', contextWindow: '200K', provider: 'Anthropic' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'OpenAI\'s flagship model', contextWindow: '128K', provider: 'OpenAI' },
];
