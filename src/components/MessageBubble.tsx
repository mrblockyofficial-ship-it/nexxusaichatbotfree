import React, { useState } from 'react';
import type { Message } from '../types';
import { User, Bot, Download, X, Copy, ThumbsUp, ThumbsDown, RotateCcw, Volume2, Edit2, Check, Trash2, Pin, Bookmark, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { StreamingRenderer } from './StreamingRenderer';

interface MessageBubbleProps {
  message: Message;
  onRegenerate: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onFeedback: (id: string, type: 'up' | 'down') => void;
  onBookmark: (id: string) => void;
  onRetry: (id: string) => void;
}

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ActionButton: React.FC<{
  onClick: () => void;
  className?: string;
  title: string;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({ onClick, className, title, ariaLabel, children }) => (
  <button
    onClick={onClick}
    className={clsx(
      'p-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.06]',
      className
    )}
    title={title}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  onEdit,
  onDelete,
  onPin,
  onFeedback,
  onBookmark,
  onRetry,
}) => {
  const isUser = message.role === 'user';
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

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

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  const timestamp = message.timestamp
    ? formatRelativeTime(message.timestamp)
    : formatRelativeTime(parseInt(message.id));

  const wordCount = message.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const isErrorMessage = message.content.startsWith('Error:');

  return (
    <>
      {showLargeImage && message.imageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setShowLargeImage(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors" onClick={() => setShowLargeImage(false)} aria-label="Close image">
              <X size={20} />
            </button>
            <img src={message.imageUrl} alt="Generated" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-elevation-4" />
            <button onClick={handleDownload} className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors font-medium shadow-lg shadow-accent/20">
              <Download size={18} /> Download Image
            </button>
          </div>
        </div>
      )}
      <div className={clsx('flex w-full mb-6 animate-fade-up group', isUser ? 'justify-end' : 'justify-start')}>
        <div className={clsx('flex max-w-[85%] md:max-w-[75%] gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
          {/* Avatar */}
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shadow-lg shadow-accent/20">
                <User size={15} className="text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Bot size={15} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 max-w-full min-w-0">
            {/* Header: name, time, badges */}
            <div className={clsx('flex items-center gap-2 mb-0.5 px-1', isUser ? 'justify-end' : 'justify-start')}>
              <span className="text-xs font-medium text-gray-500">{isUser ? 'You' : 'Nexxus AI'}</span>
              <span className="text-[10px] text-gray-600">{timestamp !== 'Invalid Date' ? timestamp : ''}</span>
              {message.pinned && <Pin size={10} className="text-amber-400 fill-amber-400/30" />}
              {message.bookmarked && <Bookmark size={10} className="text-accent fill-accent/30" />}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400">
                    <span className="truncate max-w-[120px]">{att.name}</span>
                    <span className="text-gray-600">({(att.size / 1024).toFixed(1)}KB)</span>
                  </div>
                ))}
              </div>
            )}

            {/* Message bubble */}
            <div
              className={clsx(
                'px-5 py-4 rounded-2xl shadow-elevation-1',
                isUser
                  ? 'bg-accent text-white rounded-tr-lg'
                  : 'glass-panel text-gray-200 rounded-tl-lg',
                isErrorMessage && !isUser && 'border-red-500/20 bg-red-500/[0.04]'
              )}
            >
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="w-full bg-white/10 text-white rounded-xl px-3 py-2 text-sm outline-none resize-y min-h-[60px] border border-white/10 focus:border-white/20"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => { setIsEditing(false); setEditContent(message.content); }} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]">Cancel</button>
                    <button onClick={handleEditSubmit} className="px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium">Save & Submit</button>
                  </div>
                </div>
              ) : isUser ? (
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {message.content && <StreamingRenderer content={message.content} isStreaming={message.isStreaming} />}
                  {message.imageUrl && (
                    <div
                      className="relative w-64 h-64 rounded-xl overflow-hidden cursor-pointer group/img border border-white/[0.08]"
                      onClick={() => setShowLargeImage(true)}
                    >
                      <img src={message.imageUrl} alt="Generated" className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105" />
                      <button
                        onClick={handleDownload}
                        className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-accent text-white rounded-lg backdrop-blur-sm transition-all opacity-0 group-hover/img:opacity-100"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!message.isStreaming && !isEditing && (
              <div className={clsx('flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-wrap', isUser ? 'justify-end' : 'justify-start')}>
                <span className="text-[10px] text-gray-600 mr-1.5 font-mono">{wordCount}w</span>
                {isUser ? (
                  <>
                    <ActionButton onClick={() => { setIsEditing(true); setEditContent(message.content); }} title="Edit message" ariaLabel="Edit message" className="text-gray-500 hover:text-gray-300">
                      <Edit2 size={13} />
                    </ActionButton>
                    <ActionButton onClick={handleCopy} title="Copy" ariaLabel="Copy message" className="text-gray-500 hover:text-gray-300">
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </ActionButton>
                    <ActionButton onClick={() => onPin(message.id)} title="Pin message" ariaLabel="Pin message" className={message.pinned ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'}>
                      <Pin size={13} />
                    </ActionButton>
                    <ActionButton onClick={() => onDelete(message.id)} title="Delete message" ariaLabel="Delete message" className="text-gray-500 hover:text-red-400">
                      <Trash2 size={13} />
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton onClick={handleSpeak} title={isSpeaking ? 'Stop reading' : 'Read aloud'} ariaLabel="Read aloud" className={isSpeaking ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}>
                      <Volume2 size={13} />
                    </ActionButton>
                    <ActionButton onClick={handleCopy} title="Copy" ariaLabel="Copy message" className="text-gray-500 hover:text-gray-300">
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </ActionButton>
                    <ActionButton onClick={() => onFeedback(message.id, 'up')} title="Good response" ariaLabel="Good response" className={message.feedback === 'up' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}>
                      <ThumbsUp size={13} />
                    </ActionButton>
                    <ActionButton onClick={() => onFeedback(message.id, 'down')} title="Bad response" ariaLabel="Bad response" className={message.feedback === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}>
                      <ThumbsDown size={13} />
                    </ActionButton>
                    <ActionButton onClick={() => onRegenerate(message.id)} title="Regenerate" ariaLabel="Regenerate" className="text-gray-500 hover:text-gray-300">
                      <RotateCcw size={13} />
                    </ActionButton>
                    <ActionButton onClick={() => onPin(message.id)} title="Pin message" ariaLabel="Pin message" className={message.pinned ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'}>
                      <Pin size={13} />
                    </ActionButton>
                    <ActionButton onClick={() => onBookmark(message.id)} title="Bookmark" ariaLabel="Bookmark" className={message.bookmarked ? 'text-accent' : 'text-gray-500 hover:text-gray-300'}>
                      <Bookmark size={13} />
                    </ActionButton>
                    <ActionButton onClick={() => onDelete(message.id)} title="Delete message" ariaLabel="Delete message" className="text-gray-500 hover:text-red-400">
                      <Trash2 size={13} />
                    </ActionButton>
                    {isErrorMessage && (
                      <ActionButton onClick={() => onRetry(message.id)} title="Retry" ariaLabel="Retry" className="text-amber-400 hover:text-amber-300">
                        <RefreshCw size={13} />
                      </ActionButton>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
