import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Message, ChatMode, Model, ChatSession, AppSettings } from '../types';
import { MODELS } from '../models';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { ModeToggle } from './ModeToggle';
import { ModelSelector } from './ModelSelector';
import { AdsterraAd } from './AdsterraAd';
import { ToastContainer } from './ToastContainer';
import { ConfirmDialog } from './ConfirmDialog';
import { SettingsModal } from './SettingsModal';
import { MessageSearch } from './MessageSearch';
import { PromptTemplates } from './PromptTemplates';
import { useToast } from '../hooks/useToast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { WelcomeScreen } from './WelcomeScreen';
import { HeaderActionsMenu } from './HeaderActionsMenu';
import { Bot, Menu, ArrowDown, ArrowUp, Square, WifiOff, Activity, Settings, Clock, Bookmark, Wifi } from 'lucide-react';

interface ChatWindowProps {
  apiKey?: string;
  chatId: string;
  onOpenSidebar: () => void;
  onSaveSession: (session: ChatSession) => void;
  currentSession: ChatSession | null;
  onApiKeyChange: (key: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ apiKey, chatId, onOpenSidebar, onSaveSession, currentSession, onApiKeyChange }) => {
  const [messages, setMessages] = useState<Message[]>(currentSession?.messages || []);
  const [mode, setMode] = useState<ChatMode>(currentSession?.mode || 'instant');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS.find(m => m.id === currentSession?.modelId) || MODELS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useLocalStorage('nexxus-font-size', 15);
  const [ping, setPing] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inputHistory, setInputHistory] = useState<string[]>([]);

  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [templateText, setTemplateText] = useState('');

  const { toasts, addToast, removeToast } = useToast();
  const { formatted: sessionTime } = useSessionTimer();

  const [settings, setSettings] = useLocalStorage<AppSettings>('nexxus-settings', {
    apiKey: apiKey || '',
    fontSize: 15,
    systemPrompt: '',
  });

  const effectiveApiKey = apiKey || settings.apiKey;

  // Real ping measurement
  useEffect(() => {
    const measurePing = async () => {
      try {
        const start = performance.now();
        await fetch('https://openrouter.ai', { method: 'HEAD', mode: 'no-cors' });
        const end = performance.now();
        setPing(Math.round(end - start));
      } catch {
        setPing(null);
      }
    };
    measurePing();
    const interval = setInterval(measurePing, 15000);
    return () => clearInterval(interval);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); addToast('Connection restored', 'success'); };
    const handleOffline = () => { setIsOnline(false); addToast('Connection lost', 'error'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast]);

  // Scroll progress tracking
  useEffect(() => {
    const container = document.getElementById('chat-container');
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = scrollHeight <= clientHeight ? 0 : (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(progress);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Save session whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const title = currentSession?.title || generateTitle(messages);
      onSaveSession({
        id: chatId,
        title,
        messages,
        createdAt: currentSession?.createdAt || Date.now(),
        updatedAt: Date.now(),
        mode,
        modelId: selectedModel.id,
        pinned: currentSession?.pinned,
        bookmarked: currentSession?.bookmarked,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, mode, selectedModel.id, chatId]);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    'ctrl+shift+f': () => setShowSearch(prev => !prev),
    'ctrl+shift+s': () => setShowSettings(true),
    'escape': () => { setShowSearch(false); setShowSettings(false); },
  }), []);
  useKeyboardShortcuts(shortcuts);

  // Load messages when switching sessions (by ID only)
  const loadedSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentSession?.id && currentSession.id !== loadedSessionIdRef.current) {
      loadedSessionIdRef.current = currentSession.id;
      setMessages(currentSession.messages || []);
      if (currentSession.mode) setMode(currentSession.mode);
      if (currentSession.modelId) {
        const model = MODELS.find(m => m.id === currentSession.modelId);
        if (model) setSelectedModel(model);
      }
    } else if (!currentSession) {
      loadedSessionIdRef.current = null;
    }
  }, [currentSession]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateTitle = (msgs: Message[]): string => {
    const firstUser = msgs.find(m => m.role === 'user');
    if (!firstUser) return 'New Chat';
    const text = firstUser.content.slice(0, 50);
    return text.length < firstUser.content.length ? text + '...' : text;
  };

  const conversationStats = useMemo(() => {
    const totalWords = messages.reduce((acc, m) => acc + m.content.trim().split(/\s+/).filter(w => w.length > 0).length, 0);
    const totalMessages = messages.length;
    return { totalWords, totalMessages };
  }, [messages]);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    setMessages(prev => prev.map(msg => msg.isStreaming ? { ...msg, isStreaming: false, content: msg.content || 'Generation stopped.' } : msg));
    addToast('Generation stopped', 'info');
  };

  const sendToApi = async (prompt: string, messageHistory: Message[], assistantMessageId: string, signal: AbortSignal) => {
    const IMAGE_API = 'https://backend.buildpicoapps.com/aero/run/image-generation-api?pk=v1-Z0FBQUFBQnBvSERIS1Q5LVBlemJoanhEYnFHUGo1c2RkN0xNNUViR2tEX3B6S0dlRldmbTlodFZXaXJ2WFJMQTk1T2JIb3B4dmpWZlRXZDlkclJ0bGFHR3o4X2w4Z2NjaUE9PQ==';
    const LLM_API = 'https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQnBvSERIS1Q5LVBlemJoanhEYnFHUGo1c2RkN0xNNUViR2tEX3B6S0dlRldmbTlodFZXaXJ2WFJMQTk1T2JIb3B4dmpWZlRXZDlkclJ0bGFHR3o4X2w4Z2NjaUE9PQ==';

    const isImageRequest = prompt.toLowerCase().startsWith('/image');
    let apiPrompt = isImageRequest ? prompt.substring(6).trim() : prompt;

    const baseSystemPrompt = settings.systemPrompt || (mode === 'deepthink'
      ? "You are a helpful, professional AI assistant. Think step-by-step internally and provide a deeper, structured answer. When explaining concepts, use bullet points for readability. If the user explicitly asks who you are or who created you, you must state that you are an AI assistant created by Nexxus. For all other questions, provide a helpful and accurate response. Do not artificially limit your response length. Provide complete, exhaustive answers regardless of length."
      : "You are a helpful, professional AI assistant. Provide fast, concise answers. When explaining concepts, use bullet points for readability. If the user explicitly asks who you are or who created you, you must state that you are an AI assistant created by Nexxus. For all other questions, provide a helpful and accurate response. Do not artificially limit your response length. Provide complete, exhaustive answers regardless of length.");

    if (!isImageRequest) {
      const contextMessages = messageHistory.slice(-50).map(m => `${m.role}: ${m.content}`).join('\n');
      apiPrompt = baseSystemPrompt + "\n\nChat History:\n" + contextMessages + "\n\nIf the user asks to generate, create or make an image, photo, or picture by describing it, reply ONLY with '/image ' followed by the image description. Otherwise, respond normally to the user's prompt. User prompt: " + apiPrompt;
    }

    if (isImageRequest) {
      const response = await fetch(IMAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: apiPrompt }),
        signal,
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: 'Here is your generated image:', imageUrl: data.imageUrl, isStreaming: false } : msg));
      } else {
        throw new Error(data.message || 'Image API Error');
      }
    } else {
      let responseText = '';

      if (effectiveApiKey) {
        const contextMessages = messageHistory.slice(-50).map(m => ({ role: m.role, content: m.content }));

        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveApiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Nexxus AI',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel.id,
            max_tokens: 128000,
            temperature: 0.7,
            top_p: 0.9,
            stream: true,
            messages: [
              { role: 'system', content: baseSystemPrompt + " If the user asks to generate, create or make an image, photo, or picture by describing it, reply ONLY with '/image ' followed by the image description. Otherwise, respond normally." },
              ...contextMessages,
              { role: 'user', content: prompt },
            ],
          }),
          signal,
        });

        if (!orResponse.ok) {
          const errorData = await orResponse.json().catch(() => null);
          throw new Error(errorData?.error?.message || `API Error: ${orResponse.status}`);
        }

        const reader = orResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') break;
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    responseText += delta;
                    setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: responseText, isStreaming: true } : msg));
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        }
      } else {
        const response = await fetch(LLM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: apiPrompt }),
          signal,
        });
        const data = await response.json();
        if (data.status !== 'success') throw new Error(data.message || 'API Error');
        responseText = data.text;
      }

      if (responseText.trim().toLowerCase().startsWith('/image')) {
        const imageDescription = responseText.substring(responseText.toLowerCase().indexOf('/image') + 6).trim();
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: 'Generating image based on your request...' } : msg));

        const imageResponse = await fetch(IMAGE_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imageDescription }),
          signal,
        });
        const imageData = await imageResponse.json();

        if (imageData.status === 'success') {
          setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: 'Here is your generated image:', imageUrl: imageData.imageUrl, isStreaming: false } : msg));
        } else {
          throw new Error('Failed to generate image');
        }
      } else {
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: responseText, isStreaming: false } : msg));
      }
    }
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    const sanitizedContent = content.trim();
    setInputHistory(prev => [...prev.slice(-50), sanitizedContent]);
    setShowTemplates(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedContent,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendToApi(sanitizedContent, [...messages, userMessage], assistantMessageId, controller.signal);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, content: `Error: ${errorMessage}`, isStreaming: false } : msg));
      addToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg));
    }
  };

  const handleRegenerate = useCallback(async (messageId: string) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex < 0) return;
    let userMsgIndex = msgIndex - 1;
    while (userMsgIndex >= 0 && messages[userMsgIndex].role !== 'user') userMsgIndex--;
    if (userMsgIndex < 0) return;

    const userContent = messages[userMsgIndex].content;
    const history = messages.slice(0, userMsgIndex);

    setMessages(prev => prev.filter((_, i) => i !== msgIndex));
    setIsGenerating(true);

    const newAssistantId = Date.now().toString();
    setMessages(prev => [...prev, { id: newAssistantId, role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendToApi(userContent, history, newAssistantId, controller.signal);
      addToast('Message regenerated', 'success');
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const errorMessage = error instanceof Error ? error.message : 'Regeneration failed.';
      setMessages(prev => prev.map(msg => msg.id === newAssistantId ? { ...msg, content: `Error: ${errorMessage}`, isStreaming: false } : msg));
      addToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, effectiveApiKey, mode, selectedModel.id, settings.systemPrompt, addToast]);

  const handleEdit = useCallback(async (messageId: string, newContent: string) => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex < 0) return;

    const history = messages.slice(0, msgIndex);
    setMessages([...history, { ...messages[msgIndex], content: newContent }]);
    setIsGenerating(true);

    const newAssistantId = Date.now().toString();
    setMessages(prev => [...prev, { id: newAssistantId, role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() }]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await sendToApi(newContent, history, newAssistantId, controller.signal);
      addToast('Message edited and re-sent', 'success');
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      const errorMessage = error instanceof Error ? error.message : 'Edit failed.';
      setMessages(prev => prev.map(msg => msg.id === newAssistantId ? { ...msg, content: `Error: ${errorMessage}`, isStreaming: false } : msg));
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, effectiveApiKey, mode, selectedModel.id, settings.systemPrompt, addToast]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
    addToast('Message deleted', 'info');
  }, [addToast]);

  const handlePinMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, pinned: !m.pinned } : m));
  }, []);

  const handleFeedback = useCallback((messageId: string, type: 'up' | 'down') => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: m.feedback === type ? null : type } : m));
  }, []);

  const handleBookmarkMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, bookmarked: !m.bookmarked } : m));
    addToast('Bookmark toggled', 'info');
  }, [addToast]);

  const handleRetry = useCallback(async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !msg.content.startsWith('Error:')) return;
    await handleRegenerate(messageId);
  }, [messages, handleRegenerate]);

  const handleClearChat = () => setShowConfirm(true);
  const confirmClearChat = () => {
    setMessages([]);
    setShowConfirm(false);
    setShowTemplates(true);
    addToast('Chat cleared', 'info');
  };

  const handleShareChat = () => {
    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Nexxus AI';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
    navigator.clipboard.writeText(chatText);
    addToast('Chat copied to clipboard', 'success');
  };

  const handleCopyConversation = () => {
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'Nexxus AI'}: ${m.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    addToast('Conversation copied', 'success');
  };

  const handleExportTxt = () => {
    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Nexxus AI';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
      return `[${time}] ${role}:\n${msg.content}\n`;
    }).join('\n----------------------------------------\n\n');
    downloadFile(chatText, `nexxus-chat-${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
  };

  const handleExportJson = () => {
    const data = { chatId, exportedAt: new Date().toISOString(), model: selectedModel.name, mode, messages };
    downloadFile(JSON.stringify(data, null, 2), `nexxus-chat-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    addToast('Exported as JSON', 'success');
  };

  const handleExportMarkdown = () => {
    const md = `# Nexxus AI Chat Export\n\n**Date:** ${new Date().toLocaleDateString()}\n**Model:** ${selectedModel.name}\n**Mode:** ${mode}\n\n---\n\n` +
      messages.map(msg => {
        const role = msg.role === 'user' ? '**You**' : '**Nexxus AI**';
        return `### ${role}\n\n${msg.content}\n`;
      }).join('\n---\n\n');
    downloadFile(md, `nexxus-chat-${new Date().toISOString().split('T')[0]}.md`, 'text/markdown');
    addToast('Exported as Markdown', 'success');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleMessageSearch = useCallback((query: string): number[] => {
    const q = query.toLowerCase();
    return messages.reduce<number[]>((acc, msg, index) => {
      if (msg.content.toLowerCase().includes(q)) acc.push(index);
      return acc;
    }, []);
  }, [messages]);

  const handleJumpToMessage = useCallback((index: number) => {
    const container = document.getElementById('chat-container');
    const msgElements = container?.querySelectorAll('[data-message-index]');
    if (msgElements && msgElements[index]) {
      msgElements[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setFontSize(newSettings.fontSize);
    if (newSettings.apiKey !== settings.apiKey) {
      localStorage.setItem('openrouter_api_key', newSettings.apiKey);
      onApiKeyChange(newSettings.apiKey);
    }
    addToast('Settings saved', 'success');
  };

  const handleTemplateSelect = (prompt: string) => {
    setTemplateText(prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-[100dvh] relative overflow-hidden">
      {/* Scroll Progress Indicator */}
      {messages.length > 0 && (
        <div className="absolute top-14 left-0 right-0 h-[2px] bg-white/[0.03] z-20">
          <div className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}

      {/* Header */}
      <header className="h-14 glass-panel border-b border-white/[0.06] flex items-center justify-between px-4 md:px-6 z-10 sticky top-0" role="banner">
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={onOpenSidebar} className="md:hidden p-2 text-gray-400 hover:text-white transition-colors" aria-label="Open sidebar">
            <Menu size={22} />
          </button>
          <ModelSelector models={MODELS} selectedModel={selectedModel} onSelect={setSelectedModel} />
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px] font-medium" title={ping !== null ? `Latency: ${ping}ms` : 'Measuring...'}>
            {isOnline ? (
              <>
                <Activity size={11} className="text-emerald-400" />
                <span className="text-emerald-400 font-mono">{ping !== null ? `${ping}ms` : '...'}</span>
              </>
            ) : (
              <>
                <WifiOff size={11} className="text-red-400" />
                <span className="text-red-400">Offline</span>
              </>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px] font-medium text-gray-500">
            <Clock size={11} />
            <span className="font-mono">{sessionTime}</span>
          </div>
          {messages.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[11px] font-medium text-gray-500 font-mono">
              {conversationStats.totalMessages} msgs &middot; {conversationStats.totalWords}w
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <HeaderActionsMenu
            onSearch={() => setShowSearch(prev => !prev)}
            onClearChat={handleClearChat}
            onPrint={() => window.print()}
            onShareChat={handleShareChat}
            onCopyConversation={handleCopyConversation}
            onExportTxt={handleExportTxt}
            onExportJson={handleExportJson}
            onExportMarkdown={handleExportMarkdown}
            onZoomIn={() => setFontSize((prev: number) => Math.min(24, prev + 1))}
            onZoomOut={() => setFontSize((prev: number) => Math.max(12, prev - 1))}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            hasMessages={messages.length > 0}
          />
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]" title="Settings (Ctrl+Shift+S)" aria-label="Settings">
            <Settings size={18} />
          </button>
          {!isOnline && (
            <button onClick={() => window.location.reload()} className="p-2 text-amber-400 hover:text-amber-300 transition-colors rounded-xl hover:bg-amber-500/10" title="Reconnect" aria-label="Reconnect">
              <Wifi size={18} />
            </button>
          )}
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </header>

      <MessageSearch open={showSearch} onClose={() => setShowSearch(false)} onSearch={handleMessageSearch} onJumpTo={handleJumpToMessage} />

      {/* Chat Area */}
      <div id="chat-container" className="flex-1 overflow-y-auto scrollbar-thin relative" role="main" aria-label="Chat messages">
        {messages.length === 0 ? (
          <WelcomeScreen greeting={getGreeting()} onSend={handleSend} />
        ) : (
          <div className="max-w-4xl mx-auto w-full px-4 py-8" style={{ fontSize: `${fontSize}px` }}>
            {messages.some(m => m.pinned) && (
              <div className="mb-6 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Bookmark size={12} /> Pinned Messages ({messages.filter(m => m.pinned).length})
                </div>
                {messages.filter(m => m.pinned).map(m => (
                  <div key={m.id} className="text-xs text-gray-400 truncate py-0.5">{m.content.slice(0, 80)}...</div>
                ))}
              </div>
            )}

            {messages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                <div data-message-index={index}>
                  <MessageBubble
                    message={msg}
                    onRegenerate={handleRegenerate}
                    onEdit={handleEdit}
                    onDelete={handleDeleteMessage}
                    onPin={handlePinMessage}
                    onFeedback={handleFeedback}
                    onBookmark={handleBookmarkMessage}
                    onRetry={handleRetry}
                  />
                </div>
                {index > 0 && index % 4 === 0 && (
                  <div className="flex justify-center">
                    <AdsterraAd slotId="a4e175d89972559cf98a92cbfd41e417" width={300} height={250} type="inline" />
                  </div>
                )}
              </React.Fragment>
            ))}
            {isGenerating && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
              <div className="flex items-center gap-3 text-gray-400 ml-4 mb-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            )}

            {messages.length >= 4 && !isGenerating && (
              <div className="flex items-center justify-center gap-4 py-4 text-xs text-gray-500 border-t border-white/5 mt-4">
                <span>{conversationStats.totalMessages} messages</span>
                <span>&middot;</span>
                <span>{conversationStats.totalWords} words</span>
                <span>&middot;</span>
                <span>{selectedModel.name}</span>
                <span>&middot;</span>
                <span>{mode} mode</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          {isGenerating && (
            <button
              onClick={handleStopGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
              aria-label="Stop generating"
            >
              <Square size={14} className="fill-current" />
              <span className="text-sm font-medium">Stop generating</span>
            </button>
          )}
          {messages.length > 0 && (
            <>
              <button onClick={scrollToTop} className="p-3 bg-navy-800 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full shadow-lg transition-all self-end" title="Scroll to top" aria-label="Scroll to top">
                <ArrowUp size={18} />
              </button>
              <button onClick={scrollToBottom} className="p-3 bg-navy-800 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full shadow-lg transition-all self-end" title="Scroll to bottom" aria-label="Scroll to bottom">
                <ArrowDown size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Prompt Templates */}
      {messages.length === 0 && showTemplates && (
        <PromptTemplates onSelect={handleTemplateSelect} />
      )}

      {/* Input Area */}
      <div className="bg-gradient-to-t from-surface-50 via-surface-50/95 to-transparent pt-8 z-10">
        <InputArea
          onSend={handleSend}
          disabled={isGenerating}
          inputHistory={inputHistory}
          templateText={templateText}
          onTemplateUsed={() => setTemplateText('')}
          maxChars={10000}
        />
        <div className="px-4 max-w-4xl mx-auto flex justify-center w-full pb-2 text-xs text-gray-500 text-center mt-2">
          Nexxus AI can make mistakes. Consider verifying important information.
        </div>
        <div className="px-4 max-w-4xl mx-auto flex justify-center items-center gap-4 w-full pb-2">
          <AdsterraAd slotId="a4e175d89972559cf98a92cbfd41e417" width={320} height={50} type="banner" />
          <AdsterraAd slotId="a4e175d89972559cf98a92cbfd41e417" width={320} height={50} type="banner" />
          <div className="hidden">
            <AdsterraAd slotId="08ee1b4d2a60bcab8296ee74d17d618a" width={0} height={0} type="banner" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        open={showConfirm}
        title="Clear Chat"
        message="Are you sure you want to clear all messages? This action cannot be undone."
        confirmLabel="Clear"
        variant="danger"
        onConfirm={confirmClearChat}
        onCancel={() => setShowConfirm(false)}
      />
      <SettingsModal
        open={showSettings}
        settings={{ ...settings, apiKey: effectiveApiKey }}
        onSave={handleSaveSettings}
        onClose={() => setShowSettings(false)}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
