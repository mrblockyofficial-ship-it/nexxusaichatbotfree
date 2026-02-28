export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  imageUrl?: string;
  timestamp?: number;
};

export type ChatMode = 'instant' | 'deepthink';

export type Model = {
  id: string;
  name: string;
};
