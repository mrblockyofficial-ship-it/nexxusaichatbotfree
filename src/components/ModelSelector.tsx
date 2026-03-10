import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Info, Search } from 'lucide-react';
import type { Model } from '../types';
import { clsx } from 'clsx';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: Model;
  onSelect: (model: Model) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<Model | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchFilter('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.provider?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Group by provider
  const grouped: Record<string, Model[]> = {};
  filteredModels.forEach(m => {
    const provider = m.provider || 'Other';
    if (!grouped[provider]) grouped[provider] = [];
    grouped[provider].push(m);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all duration-200 text-[13px] font-medium text-gray-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select AI model"
      >
        <span className="truncate max-w-[160px]">{selectedModel.name}</span>
        <ChevronDown size={14} className={clsx('transition-transform duration-200 text-gray-500', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-80 glass-panel-elevated rounded-xl overflow-hidden z-50 shadow-elevation-4 border border-white/[0.08]" role="listbox">
          {/* Search filter */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search models..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="w-full bg-white/[0.04] rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-white placeholder-gray-600 outline-none border border-white/[0.06] focus:border-accent/30"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto scrollbar-thin py-1">
            {Object.entries(grouped).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">
                  {provider}
                </div>
                {providerModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onSelect(model);
                      setIsOpen(false);
                      setSearchFilter('');
                    }}
                    onMouseEnter={() => setHoveredModel(model)}
                    onMouseLeave={() => setHoveredModel(null)}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2.5 text-[13px] text-left transition-colors text-gray-300',
                      selectedModel.id === model.id ? 'bg-accent/10 text-white' : 'hover:bg-white/[0.04]'
                    )}
                    role="option"
                    aria-selected={selectedModel.id === model.id}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate">{model.name}</span>
                      {model.description && (
                        <span className="text-[11px] text-gray-500 mt-0.5 truncate">{model.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {model.contextWindow && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-gray-500 font-mono">{model.contextWindow}</span>
                      )}
                      {selectedModel.id === model.id && <Check size={14} className="text-accent" />}
                    </div>
                  </button>
                ))}
              </div>
            ))}
            {filteredModels.length === 0 && (
              <div className="text-center text-gray-600 text-[12px] py-4">No models found.</div>
            )}
          </div>

          {/* Model info tooltip */}
          {hoveredModel && hoveredModel.provider && (
            <div className="px-3 py-2 border-t border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <Info size={11} />
                Provider: {hoveredModel.provider} &middot; Context: {hoveredModel.contextWindow || 'N/A'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
