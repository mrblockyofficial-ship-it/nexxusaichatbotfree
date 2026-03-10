export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  imageUrl?: string;
  timestamp?: number;
  pinned?: boolean;
  feedback?: 'up' | 'down' | null;
  attachments?: FileAttachment[];
  bookmarked?: boolean;
};

export type FileAttachment = {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
};

export type ChatMode = 'instant' | 'deepthink';

export type Model = {
  id: string;
  name: string;
  description?: string;
  contextWindow?: string;
  provider?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  mode: ChatMode;
  modelId: string;
  pinned?: boolean;
  bookmarked?: boolean;
};

export type ToastItem = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
};

export type AppSettings = {
  apiKey: string;
  fontSize: number;
  systemPrompt: string;
};
