import React, { useState } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

interface MessageSearchProps {
  open: boolean;
  onClose: () => void;
  onSearch: (query: string) => number[];
  onJumpTo: (messageId: number) => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({ open, onClose, onSearch, onJumpTo }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!open) return null;

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim().length > 0) {
      const matches = onSearch(q);
      setResults(matches);
      setCurrentIndex(0);
      if (matches.length > 0) onJumpTo(matches[0]);
    } else {
      setResults([]);
    }
  };

  const goNext = () => {
    if (results.length === 0) return;
    const next = (currentIndex + 1) % results.length;
    setCurrentIndex(next);
    onJumpTo(results[next]);
  };

  const goPrev = () => {
    if (results.length === 0) return;
    const prev = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prev);
    onJumpTo(results[prev]);
  };

  return (
    <div className="absolute top-14 right-4 z-50 glass-panel-elevated rounded-xl border border-white/[0.08] shadow-elevation-3 p-3 w-80">
      <div className="flex items-center gap-2">
        <Search size={15} className="text-gray-500 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') goNext();
          }}
          placeholder="Search messages..."
          className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 outline-none"
        />
        {results.length > 0 && (
          <span className="text-[11px] text-gray-500 flex-shrink-0 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">
            {currentIndex + 1}/{results.length}
          </span>
        )}
        {query && results.length === 0 && (
          <span className="text-[11px] text-gray-600 flex-shrink-0">No results</span>
        )}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={goPrev} className="p-1 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors" disabled={results.length === 0}>
            <ChevronUp size={14} />
          </button>
          <button onClick={goNext} className="p-1 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors" disabled={results.length === 0}>
            <ChevronDown size={14} />
          </button>
        </div>
        <button onClick={onClose} className="p-1 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
