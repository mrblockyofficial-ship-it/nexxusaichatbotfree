import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Globe } from 'lucide-react';
import { clsx } from 'clsx';

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const [webSearch, setWebSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-2 pt-2">
      <div className="relative flex flex-col bg-[#2f2f2f] border border-white/10 rounded-2xl shadow-2xl focus-within:border-white/30 transition-all duration-300">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Nexxus AI..."
          className="w-full bg-transparent text-gray-100 placeholder-gray-400 resize-none outline-none p-4 max-h-[40vh] min-h-[60px] text-[15px] leading-relaxed scrollbar-hide"
          rows={1}
          disabled={disabled}
        />
        
        <div className="flex items-center justify-between px-3 pb-3 pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              disabled={disabled}
              title="Attach file"
            >
              <Paperclip size={18} />
            </button>
            <button
              type="button"
              onClick={() => setWebSearch(!webSearch)}
              className={clsx(
                "p-2 rounded-lg transition-colors",
                webSearch ? "text-accent bg-accent/10" : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
              disabled={disabled}
              title="Search web"
            >
              <Globe size={18} />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              disabled={disabled}
              title="Voice input"
            >
              <Mic size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden md:inline-block font-medium">
              {input.length > 0 ? `${input.length} chars` : 'Press Enter to send'}
            </span>
            <button
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              className={clsx(
                'p-2 rounded-xl transition-all duration-300 flex items-center justify-center',
                disabled || !input.trim()
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-navy-900 hover:bg-gray-200 shadow-lg hover:scale-105'
              )}
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
      <div className="text-center mt-3 text-xs text-gray-500 font-medium tracking-wide">
        AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
};
