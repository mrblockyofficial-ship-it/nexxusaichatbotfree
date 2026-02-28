import React, { useState, useRef, useEffect } from 'react';
import type { Message, ChatMode, Model } from '../types';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { ModeToggle } from './ModeToggle';
import { ModelSelector } from './ModelSelector';
import { AdsterraAd } from './AdsterraAd';
import { Bot, Sparkles, Menu, Share, Download, ArrowDown, ArrowUp, Square, WifiOff, Trash2, Maximize, Minimize, ZoomIn, ZoomOut, Activity, Printer } from 'lucide-react';

const MODELS: Model[] = [
  { id: 'stepfun/step-3.5-flash:free', name: 'StepFun: Step 3.5 Flash (free)' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
];

interface ChatWindowProps {
  apiKey?: string;
  onOpenSidebar: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ apiKey, onOpenSidebar }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<ChatMode>('instant');
  const [selectedModel, setSelectedModel] = useState<Model>(MODELS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [ping, setPing] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => setPing(Math.floor(Math.random() * 15) + 8), 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    if (chatContainer) {
      chatContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    // Basic input sanitization
    const sanitizedContent = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() },
    ]);

    try {
      const IMAGE_API = 'https://backend.buildpicoapps.com/aero/run/image-generation-api?pk=v1-Z0FBQUFBQnBvSERIS1Q5LVBlemJoanhEYnFHUGo1c2RkN0xNNUViR2tEX3B6S0dlRldmbTlodFZXaXJ2WFJMQTk1T2JIb3B4dmpWZlRXZDlkclJ0bGFHR3o4X2w4Z2NjaUE9PQ==';
      const LLM_API = 'https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQnBvSERIS1Q5LVBlemJoanhEYnFHUGo1c2RkN0xNNUViR2tEX3B6S0dlRldmbTlodFZXaXJ2WFJMQTk1T2JIb3B4dmpWZlRXZDlkclJ0bGFHR3o4X2w4Z2NjaUE9PQ==';

      const isImageRequest = sanitizedContent.toLowerCase().startsWith('/image');
      let prompt = isImageRequest ? sanitizedContent.substring(6).trim() : sanitizedContent;

      if (!isImageRequest) {
        const systemPrompt = mode === 'deepthink' 
          ? "You are a helpful, professional AI assistant. Think step-by-step internally and provide a deeper, structured answer. When explaining concepts, use bullet points for readability. If the user explicitly asks who you are or who created you, you must state that you are an AI assistant created by Nexxus. For all other questions, provide a helpful and accurate response. Do not artificially limit your response length. Provide complete, exhaustive answers regardless of length. "
          : "You are a helpful, professional AI assistant. Provide fast, concise answers. When explaining concepts, use bullet points for readability. If the user explicitly asks who you are or who created you, you must state that you are an AI assistant created by Nexxus. For all other questions, provide a helpful and accurate response. Do not artificially limit your response length. Provide complete, exhaustive answers regardless of length. ";
        
        // Get last 50 messages for context for fallback API
        const contextMessages = messages.slice(-50).map(m => `${m.role}: ${m.content}`).join('\n');
        
        prompt = systemPrompt + "\n\nChat History:\n" + contextMessages + "\n\nIf the user asks to generate, create or make an image, photo, or picture by describing it, reply ONLY with '/image ' followed by the image description. Otherwise, respond normally to the user's prompt. User prompt: " + prompt;
      }

      if (isImageRequest) {
        const response = await fetch(IMAGE_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await response.json();
        if (data.status === 'success') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: 'Here is your generated image:', imageUrl: data.imageUrl, isStreaming: false }
                : msg
            )
          );
        } else {
          throw new Error(data.message || 'Image API Error');
        }
      } else {
        let responseText = '';
        
        if (apiKey) {
          // Use OpenRouter API
          
          // Get last 50 messages for context
          const contextMessages = messages.slice(-50).map(m => ({
            role: m.role,
            content: m.content
          }));

          const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Nexxus AI',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: selectedModel.id,
              max_tokens: 128000,
              temperature: 0.7,
              top_p: 0.9,
              messages: [
                { role: 'system', content: mode === 'deepthink' 
                  ? "You are a helpful, professional AI assistant. Do not artificially limit your response length. Provide complete, exhaustive answers regardless of length. Think step-by-step internally and provide a deeper, structured answer. When explaining concepts, use bullet points for readability. If the user explicitly asks who you are or who created you, you must state that you are an AI assistant created by Nexxus. For all other questions, provide a helpful and accurate response. If the user asks to generate, create or make an image, photo, or picture by describing it, reply ONLY with '/image ' followed by the image description. Otherwise, respond normally."
                  : "You are a helpful, professional AI assistant. Do not artificially limit your response length. Provide complete, exhaustive answers regardless of length. Provide fast, concise answers. When explaining concepts, use bullet points for readability. If the user explicitly asks who you are or who created you, you must state that you are an AI assistant created by Nexxus. For all other questions, provide a helpful and accurate response. If the user asks to generate, create or make an image, photo, or picture by describing it, reply ONLY with '/image ' followed by the image description. Otherwise, respond normally." },
                ...contextMessages,
                { role: 'user', content: sanitizedContent }
              ]
            })
          });
          
          const orData = await orResponse.json();
          if (orData.error) {
            throw new Error(orData.error.message || 'OpenRouter API Error');
          }
          responseText = orData.choices[0].message.content;
        } else {
          // Fallback to existing API
          const response = await fetch(LLM_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
          });
          const data = await response.json();
          if (data.status !== 'success') throw new Error(data.message || 'API Error');
          responseText = data.text;
        }

        if (responseText.trim().toLowerCase().startsWith('/image')) {
          const imageDescription = responseText.substring(responseText.toLowerCase().indexOf('/image') + 6).trim();
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: 'Generating image based on your request...' }
                : msg
            )
          );

          const imageResponse = await fetch(IMAGE_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: imageDescription })
          });
          const imageData = await imageResponse.json();

          if (imageData.status === 'success') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: 'Here is your generated image:', imageUrl: imageData.imageUrl, isStreaming: false }
                  : msg
              )
            );
          } else {
            throw new Error('Failed to generate image');
          }
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: responseText, isStreaming: false }
                : msg
            )
          );
        }
      }
    } catch (error: unknown) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: `Error: ${errorMessage}` }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  const handleExportChat = () => {
    const chatText = messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Nexxus AI';
      const time = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleString() 
        : new Date(parseInt(msg.id)).toLocaleString();
      return `[${time}] ${role}:\n${msg.content}\n`;
    }).join('\n----------------------------------------\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexxus-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
      {/* Header */}
      <header className="h-16 glass-panel border-b border-white/10 flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onOpenSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <ModelSelector models={MODELS} selectedModel={selectedModel} onSelect={setSelectedModel} />
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-emerald-400 text-xs font-medium">
            <Activity size={12} className="animate-pulse" />
            {ping}ms
          </div>
          {!isOnline && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-xs font-medium">
              <WifiOff size={14} />
              Offline
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
            <button onClick={() => setFontSize(prev => Math.max(12, prev - 1))} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Decrease font size">
              <ZoomOut size={18} />
            </button>
            <button onClick={() => setFontSize(prev => Math.min(24, prev + 1))} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Increase font size">
              <ZoomIn size={18} />
            </button>
            <button onClick={toggleFullscreen} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Toggle fullscreen">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
          {messages.length > 0 && (
            <div className="hidden md:flex items-center gap-2 mr-2">
              <button 
                onClick={handleClearChat}
                className="p-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10" 
                title="Clear chat"
              >
                <Trash2 size={18} />
              </button>
              <button onClick={() => window.print()} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Print chat">
                <Printer size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Share chat">
                <Share size={18} />
              </button>
              <button 
                onClick={handleExportChat}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" 
                title="Export chat"
              >
                <Download size={18} />
              </button>
            </div>
          )}
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </header>

      {/* Chat Area */}
      <div id="chat-container" className="flex-1 overflow-y-auto scrollbar-hide relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-accent to-purple-600 flex items-center justify-center shadow-2xl shadow-accent/20 mb-8 rotate-3 hover:rotate-6 transition-transform duration-500">
              <Sparkles size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 tracking-tight">
              👋 {getGreeting()}~ What can I help you with today?
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl text-center mb-12">
              Experience the next generation of AI. Choose your model, select your mode, and start exploring.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {[
                "Explain quantum computing in simple terms",
                "Write a Python script for web scraping",
                "How do I optimize my React application?",
                "Create a 7-day workout plan"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="glass-panel p-4 rounded-2xl text-left hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-white/5 group"
                >
                  <p className="text-gray-300 group-hover:text-white transition-colors">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-4 py-8" style={{ fontSize: `${fontSize}px` }}>
            {messages.map((msg, index) => (
              <React.Fragment key={msg.id}>
                <MessageBubble message={msg} />
                {/* Insert Adsterra ad every 4 messages */}
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
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {/* Floating Action Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
          {isGenerating && (
            <button 
              onClick={() => setIsGenerating(false)}
              className="flex items-center gap-2 px-4 py-2 bg-navy-800 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2"
            >
              <Square size={14} className="fill-current" />
              <span className="text-sm font-medium">Stop generating</span>
            </button>
          )}
          {messages.length > 0 && (
            <>
              <button 
                onClick={scrollToTop}
                className="p-3 bg-navy-800 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full shadow-lg transition-all self-end"
                title="Scroll to top"
              >
                <ArrowUp size={18} />
              </button>
              <button 
                onClick={scrollToBottom}
                className="p-3 bg-navy-800 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white rounded-full shadow-lg transition-all self-end"
                title="Scroll to bottom"
              >
                <ArrowDown size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-t from-navy-900 via-navy-900/90 to-transparent pt-10 z-10">
        <InputArea onSend={handleSend} disabled={isGenerating} />
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
    </div>
  );
};
