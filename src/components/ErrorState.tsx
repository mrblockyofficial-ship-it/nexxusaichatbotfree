import React from 'react';
import { WifiOff, AlertTriangle, Clock, RefreshCw, ServerCrash } from 'lucide-react';

interface ErrorStateProps {
  type: 'offline' | 'api-error' | 'rate-limit' | 'server-error';
  message?: string;
  onRetry?: () => void;
}

const errorConfig = {
  'offline': {
    icon: WifiOff,
    title: 'You\'re offline',
    description: 'Check your internet connection and try again.',
    iconColor: 'text-gray-400',
    bgColor: 'bg-gray-500/[0.06]',
  },
  'api-error': {
    icon: AlertTriangle,
    title: 'Something went wrong',
    description: 'We couldn\'t process your request. Please try again.',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/[0.06]',
  },
  'rate-limit': {
    icon: Clock,
    title: 'Rate limit reached',
    description: 'You\'ve sent too many requests. Please wait a moment.',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/[0.06]',
  },
  'server-error': {
    icon: ServerCrash,
    title: 'Server error',
    description: 'The AI service is temporarily unavailable.',
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/[0.06]',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({ type, message, onRetry }) => {
  const config = errorConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className={`w-16 h-16 rounded-2xl ${config.bgColor} flex items-center justify-center mb-4`}>
        <Icon size={28} className={config.iconColor} />
      </div>
      <h3 className="text-[15px] font-semibold text-white mb-2">{config.title}</h3>
      <p className="text-[13px] text-gray-500 max-w-xs mb-4 leading-relaxed">
        {message || config.description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-[13px] font-medium text-gray-300 hover:bg-white/[0.1] hover:text-white transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
};
