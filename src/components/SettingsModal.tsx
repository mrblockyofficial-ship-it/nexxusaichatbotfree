import React, { useState } from 'react';
import { X, Key, Type, MessageSquare, Palette, Shield, ExternalLink } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  open: boolean;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, settings, onSave, onClose }) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'prompt'>('general');

  if (!open) return null;

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Type },
    { id: 'api' as const, label: 'API Key', icon: Key },
    { id: 'prompt' as const, label: 'System Prompt', icon: MessageSquare },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Settings">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-lg mx-4 shadow-elevation-4 border border-white/[0.08]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
              <Palette size={16} className="text-gray-400" />
            </div>
            <h2 className="text-[15px] font-semibold text-white">Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-white/[0.06]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-accent text-accent bg-accent/[0.04]'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="text-[13px] font-medium text-gray-300 mb-2.5 block">Font Size</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={12}
                    max={24}
                    value={form.fontSize}
                    onChange={e => setForm(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="flex-1 accent-accent"
                  />
                  <span className="text-[13px] text-white font-mono bg-white/[0.06] px-2.5 py-1 rounded-lg min-w-[48px] text-center">
                    {form.fontSize}px
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-600 mt-1">
                  <span>Smaller</span>
                  <span>Larger</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[12px] text-gray-500 mb-2">Preview</div>
                <p style={{ fontSize: `${form.fontSize}px` }} className="text-gray-200 leading-relaxed">
                  The quick brown fox jumps over the lazy dog. This is how your messages will appear.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-300 mb-2 block">OpenRouter API Key</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Shield size={14} className="text-gray-600" />
                  </div>
                  <input
                    type="password"
                    value={form.apiKey}
                    onChange={e => setForm(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="sk-or-..."
                    className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-gray-600 font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[11px] text-gray-600 flex-1">Your API key is stored locally and never sent to our servers.</p>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-accent hover:text-accent-light transition-colors"
                  >
                    Get key <ExternalLink size={10} />
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/10">
                <p className="text-[11px] text-amber-400/80 leading-relaxed">
                  Leave blank to use the free fallback API with limited capabilities. Add your OpenRouter key to unlock all models.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-300 mb-2 block">Custom System Prompt</label>
                <textarea
                  value={form.systemPrompt}
                  onChange={e => setForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="Enter a custom system prompt to change the AI's behavior..."
                  className="w-full glass-input rounded-xl px-4 py-3 text-[13px] text-white placeholder-gray-600 min-h-[150px] resize-y leading-relaxed"
                  rows={6}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-gray-600">This prompt is prepended to every conversation.</p>
                  <span className="text-[10px] text-gray-600 font-mono">{form.systemPrompt.length} chars</span>
                </div>
              </div>

              {form.systemPrompt && (
                <button
                  onClick={() => setForm(prev => ({ ...prev, systemPrompt: '' }))}
                  className="text-[12px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Reset to default
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-medium text-gray-400 hover:bg-white/[0.06] transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-xl text-[13px] font-medium bg-accent hover:bg-accent-hover text-white transition-colors shadow-lg shadow-accent/20">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
