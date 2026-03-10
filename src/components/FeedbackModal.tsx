import React, { useState } from 'react';
import { X, ThumbsDown, AlertCircle, Bug, Lightbulb } from 'lucide-react';

interface FeedbackModalProps {
  open: boolean;
  messageId: string;
  onSubmit: (messageId: string, category: string, comment: string) => void;
  onClose: () => void;
}

const categories = [
  { id: 'inaccurate', label: 'Inaccurate', icon: AlertCircle, color: 'text-red-400' },
  { id: 'unhelpful', label: 'Not helpful', icon: ThumbsDown, color: 'text-amber-400' },
  { id: 'harmful', label: 'Harmful', icon: Bug, color: 'text-red-500' },
  { id: 'other', label: 'Other', icon: Lightbulb, color: 'text-blue-400' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, messageId, onSubmit, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [comment, setComment] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (selectedCategory) {
      onSubmit(messageId, selectedCategory, comment);
      setSelectedCategory('');
      setComment('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label="Feedback">
      <div className="glass-panel-elevated rounded-2xl w-full max-w-md mx-4 shadow-elevation-4 border border-white/[0.08]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ThumbsDown size={16} className="text-red-400" />
            </div>
            <h2 className="text-[15px] font-semibold text-white">What went wrong?</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'border-accent/40 bg-accent/10 text-white'
                    : 'border-white/[0.06] bg-white/[0.02] text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                }`}
              >
                <cat.icon size={15} className={selectedCategory === cat.id ? 'text-accent' : cat.color} />
                {cat.label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-[12px] font-medium text-gray-500 mb-1.5 block">Additional comments (optional)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us more about what went wrong..."
              className="w-full glass-input rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-gray-600 min-h-[80px] resize-y"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-medium text-gray-400 hover:bg-white/[0.06] transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedCategory}
            className="px-4 py-2 rounded-xl text-[13px] font-medium bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};
