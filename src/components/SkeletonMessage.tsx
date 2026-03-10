import React from 'react';

interface SkeletonMessageProps {
  isUser?: boolean;
}

export const SkeletonMessage: React.FC<SkeletonMessageProps> = ({ isUser = false }) => {
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar skeleton */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] animate-pulse" />
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {/* Name and timestamp */}
          <div className="flex items-center gap-2 px-1">
            <div className="h-3 w-16 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-10 rounded bg-white/[0.04] animate-pulse" />
          </div>

          {/* Message bubble */}
          <div className={`px-5 py-4 rounded-2xl ${isUser ? 'bg-accent/20 rounded-tr-lg' : 'glass-panel rounded-tl-lg'}`}>
            <div className="space-y-2.5">
              <div className="h-3.5 rounded bg-white/[0.06] animate-pulse" style={{ width: '85%' }} />
              <div className="h-3.5 rounded bg-white/[0.06] animate-pulse" style={{ width: '70%' }} />
              {!isUser && (
                <>
                  <div className="h-3.5 rounded bg-white/[0.06] animate-pulse" style={{ width: '90%' }} />
                  <div className="h-3.5 rounded bg-white/[0.06] animate-pulse" style={{ width: '45%' }} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonConversation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8">
      <SkeletonMessage isUser />
      <SkeletonMessage />
      <SkeletonMessage isUser />
      <SkeletonMessage />
    </div>
  );
};
