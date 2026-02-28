import React, { useState } from 'react';
import type { Message } from '../types';
import { User, Bot, Download, X, Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2, Edit2, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { StreamingRenderer } from './StreamingRenderer';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (message.imageUrl) {
      const a = document.createElement('a');
      a.href = message.imageUrl;
      a.download = 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const timestamp = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(parseInt(message.id)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const wordCount = message.content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <>
      {showLargeImage && message.imageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setShowLargeImage(false)}>
          <div className="relative max-w-5xl max-h-[90vh] w-full p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors" onClick={() => setShowLargeImage(false)}>
              <X size={24} />
            </button>
            <img src={message.imageUrl} alt="Generated" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
            <button onClick={handleDownload} className="mt-4 flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-full transition-colors font-medium">
              <Download size={18} /> Download Image
            </button>
          </div>
        </div>
      )}
      <div className={clsx('flex w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 group', isUser ? 'justify-end' : 'justify-start')}>
        <div className={clsx('flex max-w-[85%] md:max-w-[75%] gap-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-lg">
                <User size={16} className="text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
                <Bot size={16} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 max-w-full">
            <div className={clsx("flex items-center gap-2 mb-1 px-1", isUser ? "justify-end" : "justify-start")}>
              <span className="text-xs font-medium text-gray-400">{isUser ? 'You' : 'Nexxus AI'}</span>
              <span className="text-[10px] text-gray-500">{timestamp !== 'Invalid Date' ? timestamp : ''}</span>
            </div>
            <div
              className={clsx(
                'px-5 py-4 rounded-2xl shadow-md',
                isUser
                  ? 'bg-accent text-white rounded-tr-sm'
                  : 'glass-panel text-gray-200 rounded-tl-sm border border-white/10'
              )}
            >
              {isUser ? (
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {message.content && <StreamingRenderer content={message.content} isStreaming={message.isStreaming} />}
                  {message.imageUrl && (
                    <div 
                      className="relative w-64 h-64 rounded-xl overflow-hidden cursor-pointer group border border-white/10"
                      onClick={() => setShowLargeImage(true)}
                    >
                      <img src={message.imageUrl} alt="Generated" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <button 
                        onClick={handleDownload}
                        className="absolute bottom-2 right-2 p-2 bg-black/50 hover:bg-accent text-white rounded-lg backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            {!message.isStreaming && (
              <div className={clsx("flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity", isUser ? "justify-end" : "justify-start")}>
                <span className="text-[10px] text-gray-500 mr-2">{wordCount} words</span>
                {isUser ? (
                  <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-md hover:bg-white/5" title="Edit message">
                    <Edit2 size={14} />
                  </button>
                ) : (
                  <>
                    <button onClick={handleSpeak} className={clsx("p-1.5 transition-colors rounded-md hover:bg-white/5", isSpeaking ? "text-accent" : "text-gray-500 hover:text-gray-300")} title={isSpeaking ? "Stop reading" : "Read aloud"}>
                      <Volume2 size={14} />
                    </button>
                    <button onClick={handleCopy} className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-md hover:bg-white/5" title="Copy">
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-md hover:bg-white/5" title="Good response">
                      <ThumbsUp size={14} />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-md hover:bg-white/5" title="Bad response">
                      <ThumbsDown size={14} />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-300 transition-colors rounded-md hover:bg-white/5" title="Regenerate">
                      <RotateCcw size={14} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Large Image Modal */}
      {showLargeImage && message.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowLargeImage(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowLargeImage(false);
              }}
            >
              <X size={24} />
            </button>
            <img 
              src={message.imageUrl} 
              alt="Generated Large" 
              className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={handleDownload}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-colors shadow-lg"
            >
              <Download size={20} />
              Download Image
            </button>
          </div>
        </div>
      )}
    </>
  );
};
