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
    <div className="flex items-center bg-white/[0.04] rounded-xl p-0.5 border border-white/[0.06]">
      <button
        onClick={() => setMode('instant')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all duration-300',
          mode === 'instant'
            ? 'bg-accent text-white shadow-md shadow-accent/30'
            : 'text-gray-500 hover:text-gray-300'
        )}
      >
        <Zap size={14} className={mode === 'instant' ? 'text-yellow-300' : ''} />
        Instant
      </button>
      <button
        onClick={() => setMode('deepthink')}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all duration-300',
          mode === 'deepthink'
            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
            : 'text-gray-500 hover:text-gray-300'
        )}
      >
        <Brain size={14} className={mode === 'deepthink' ? 'text-violet-200' : ''} />
        DeepThink
      </button>
    </div>
  );
};
