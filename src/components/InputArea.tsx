import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Mic, MicOff, Globe, Image, X, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import type { FileAttachment } from '../types';

interface InputAreaProps {
  onSend: (message: string, attachments?: FileAttachment[]) => void;
  disabled: boolean;
  inputHistory?: string[];
  templateText?: string;
  onTemplateUsed?: () => void;
  maxChars?: number;
}

const placeholders = [
  'Message Nexxus AI...',
  'Ask me anything...',
  'Write code, analyze data, create content...',
  'What would you like to explore?',
  'Describe an image to generate...',
];

export const InputArea: React.FC<InputAreaProps> = ({
  onSend,
  disabled,
  inputHistory = [],
  templateText = '',
  onTemplateUsed,
  maxChars = 10000,
}) => {
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<ReturnType<typeof Object> | null>(null);

  // Rotating placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Template text injection
  const [appliedTemplate, setAppliedTemplate] = useState('');
  if (templateText && templateText !== appliedTemplate) {
    setAppliedTemplate(templateText);
    setInput(templateText);
    onTemplateUsed?.();
  }

  // Auto-resize textarea with smooth transition
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [input]);

  // Clipboard paste for images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setAttachments(prev => [...prev, {
                name: `pasted-image-${Date.now()}.png`,
                type: file.type,
                size: file.size,
                dataUrl: reader.result as string,
              }]);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  // Drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
      setHistoryIndex(-1);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Input history navigation
    if (e.key === 'ArrowUp' && input === '' && inputHistory.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex < inputHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(newIndex);
      setInput(inputHistory[inputHistory.length - 1 - newIndex] || '');
    }
    if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(newIndex >= 0 ? inputHistory[inputHistory.length - 1 - newIndex] || '' : '');
    }
  };

  // File attachment handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Voice input via Web Speech Recognition API
  const voiceBaseTextRef = useRef('');
  const handleVoiceInput = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    voiceBaseTextRef.current = input;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string }; isFinal?: boolean } }; resultIndex?: number }) => {
      let finalTranscript = '';
      let interimTranscript = '';
      const results = event.results;
      for (const key in results) {
        if (results[key]?.[0]?.transcript) {
          if (results[key].isFinal) {
            finalTranscript += results[key][0].transcript;
          } else {
            interimTranscript += results[key][0].transcript;
          }
        }
      }
      const transcript = finalTranscript || interimTranscript;
      setInput(voiceBaseTextRef.current + (voiceBaseTextRef.current ? ' ' : '') + transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [isListening, input]);

  const charPercent = Math.min(100, (input.length / maxChars) * 100);
  const charWarning = input.length > maxChars * 0.9;
  const charExceeded = input.length > maxChars;

  // SVG circular progress
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (charPercent / 100) * circumference;

  return (
    <div
      className="relative w-full max-w-4xl mx-auto px-4 pb-2 pt-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-2 border-dashed border-accent/50 bg-accent/[0.06] backdrop-blur-sm m-4">
          <div className="text-accent font-medium text-sm flex items-center gap-2">
            <Paperclip size={18} />
            Drop files here to attach
          </div>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 px-1">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-gray-300 group/att">
              {att.type.startsWith('image/') && att.dataUrl ? (
                <img src={att.dataUrl} alt={att.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <FileText size={14} className="text-gray-500" />
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="truncate max-w-[100px] text-[12px] font-medium">{att.name}</span>
                <span className="text-[10px] text-gray-600">{formatFileSize(att.size)}</span>
              </div>
              <button
                onClick={() => removeAttachment(i)}
                className="p-0.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg opacity-0 group-hover/att:opacity-100"
                aria-label="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={clsx(
        'relative flex flex-col rounded-2xl shadow-elevation-2 transition-all duration-300',
        'bg-surface-200 border',
        isDragOver
          ? 'border-accent/40 ring-2 ring-accent/20'
          : 'border-white/[0.08] focus-within:border-white/[0.15] focus-within:shadow-elevation-3'
      )}>
        {/* Voice listening indicator */}
        {isListening && (
          <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-1">
              {[14, 20, 10, 18, 12].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}px`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-red-400 font-medium">Listening...</span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[placeholderIndex]}
          className="w-full bg-transparent text-gray-100 placeholder-gray-500 resize-none outline-none p-4 max-h-[40vh] min-h-[56px] text-[15px] leading-relaxed scrollbar-thin"
          rows={1}
          disabled={disabled}
          aria-label="Message input"
          enterKeyHint="send"
        />

        <div className="flex items-center justify-between px-3 pb-3 pt-0.5">
          <div className="flex items-center gap-0.5">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.txt,.csv,.json,.md"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
              disabled={disabled}
              title="Attach file"
              aria-label="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <button
              type="button"
              onClick={() => setWebSearch(!webSearch)}
              className={clsx(
                'p-2 rounded-xl transition-colors',
                webSearch ? 'text-accent bg-accent/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'
              )}
              disabled={disabled}
              title="Search web"
              aria-label="Toggle web search"
            >
              <Globe size={18} />
            </button>
            <button
              type="button"
              onClick={handleVoiceInput}
              className={clsx(
                'p-2 rounded-xl transition-colors',
                isListening ? 'text-red-400 bg-red-400/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'
              )}
              disabled={disabled}
              title={isListening ? 'Stop listening' : 'Voice input'}
              aria-label="Voice input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              type="button"
              onClick={() => setInput(prev => prev + '/image ')}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
              disabled={disabled}
              title="Generate image"
              aria-label="Generate image"
            >
              <Image size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Character count circular progress */}
            {input.length > 0 && (
              <div className="relative w-7 h-7 hidden md:flex items-center justify-center">
                <svg className="w-7 h-7 -rotate-90" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    fill="none"
                    stroke={charExceeded ? '#ef4444' : charWarning ? '#f59e0b' : '#3b82f6'}
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-200"
                  />
                </svg>
              </div>
            )}
            <button
              onClick={handleSend}
              disabled={disabled || !input.trim() || charExceeded}
              className={clsx(
                'p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center',
                disabled || !input.trim() || charExceeded
                  ? 'bg-white/[0.04] text-gray-600 cursor-not-allowed'
                  : 'bg-white text-surface-50 hover:bg-gray-200 shadow-lg hover:scale-105 glow-accent'
              )}
              aria-label="Send message"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Augment global Window for SpeechRecognition
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
