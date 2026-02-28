import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Model } from '../types';
import { clsx } from 'clsx';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model;
  onSelect: (model: Model) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 transition-colors text-sm font-medium text-gray-200"
      >
        {selectedModel.name}
        <ChevronDown size={16} className={clsx('transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-56 glass-panel rounded-xl overflow-hidden z-50 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelect(model);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-white/10 transition-colors text-gray-200"
              >
                {model.name}
                {selectedModel.id === model.id && <Check size={16} className="text-accent" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
