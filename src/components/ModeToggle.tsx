import React from 'react';
import { Brain, Zap } from 'lucide-react';
import type { ChatMode } from '../types';
import { clsx } from 'clsx';

interface ModeToggleProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, setMode }) => {
  return (
    <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 shadow-inner">
      <button
        onClick={() => setMode('instant')}
        className={clsx(
          'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          mode === 'instant'
            ? 'bg-accent text-white shadow-md'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        <Zap size={16} className={mode === 'instant' ? 'text-yellow-300' : ''} />
        Instant
      </button>
      <button
        onClick={() => setMode('deepthink')}
        className={clsx(
          'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300',
          mode === 'deepthink'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        <Brain size={16} className={mode === 'deepthink' ? 'text-purple-200' : ''} />
        DeepThink
      </button>
    </div>
  );
};
