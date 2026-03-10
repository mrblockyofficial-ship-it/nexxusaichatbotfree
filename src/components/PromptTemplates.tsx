import React from 'react';
import { Sparkles, Code, Globe, Zap, Lightbulb, FileText, PenTool, Calculator } from 'lucide-react';

interface PromptTemplatesProps {
  onSelect: (prompt: string) => void;
}

const templates = [
  { icon: Code, label: 'Write Code', prompt: 'Write a function that ', color: 'text-emerald-400', bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/10' },
  { icon: Lightbulb, label: 'Explain', prompt: 'Explain how ', color: 'text-amber-400', bg: 'bg-amber-500/[0.06]', border: 'border-amber-500/10' },
  { icon: PenTool, label: 'Write', prompt: 'Write a professional ', color: 'text-violet-400', bg: 'bg-violet-500/[0.06]', border: 'border-violet-500/10' },
  { icon: Globe, label: 'Translate', prompt: 'Translate the following to ', color: 'text-blue-400', bg: 'bg-blue-500/[0.06]', border: 'border-blue-500/10' },
  { icon: FileText, label: 'Summarize', prompt: 'Summarize the following: ', color: 'text-orange-400', bg: 'bg-orange-500/[0.06]', border: 'border-orange-500/10' },
  { icon: Calculator, label: 'Math', prompt: 'Solve this math problem: ', color: 'text-pink-400', bg: 'bg-pink-500/[0.06]', border: 'border-pink-500/10' },
  { icon: Zap, label: 'Debug', prompt: 'Debug this code and explain the issue: ', color: 'text-red-400', bg: 'bg-red-500/[0.06]', border: 'border-red-500/10' },
  { icon: Sparkles, label: 'Creative', prompt: 'Generate a creative ', color: 'text-teal-400', bg: 'bg-teal-500/[0.06]', border: 'border-teal-500/10' },
];

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2 max-w-4xl mx-auto justify-center">
      {templates.map((t, i) => (
        <button
          key={i}
          onClick={() => onSelect(t.prompt)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${t.bg} border ${t.border} hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-200 text-[12px] font-medium text-gray-400 hover:text-white`}
        >
          <t.icon size={13} className={t.color} />
          {t.label}
        </button>
      ))}
    </div>
  );
};
