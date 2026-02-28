import React, { useState } from 'react';
import { MessageSquare, Plus, User, LogOut, Search, Trash2, Zap, PanelLeftClose, PanelLeftOpen, Pin } from 'lucide-react';
import { AdsterraAd } from './AdsterraAd';

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-16 h-screen glass-panel border-r border-white/10 flex flex-col items-center py-4 bg-navy-900 md:bg-transparent transition-all duration-300">
        <button onClick={() => setIsCollapsed(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-4" title="Expand sidebar">
          <PanelLeftOpen size={20} />
        </button>
        <button onClick={onNewChat} className="p-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors mb-4" title="New Chat">
          <Plus size={20} />
        </button>
        <div className="flex-1" />
        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors mt-auto" title="My Account">
          <User size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 h-screen glass-panel border-r border-white/10 flex flex-col bg-navy-900 md:bg-transparent transition-all duration-300">
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-white tracking-wide">Nexxus AI</span>
          <button onClick={() => setIsCollapsed(true)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block" title="Close sidebar">
            <PanelLeftClose size={18} />
          </button>
        </div>
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-lg transition-colors font-medium shadow-lg shadow-accent/20"
        >
          <Plus size={18} />
          New Chat
        </button>
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search chats..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-4">
        {/* Pinned */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
            <Pin size={12} /> Pinned
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-left group">
            <MessageSquare size={16} className="text-accent" />
            <span className="truncate text-sm flex-1 font-medium">Project Brainstorming</span>
          </button>
        </div>

        {/* Today */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Today</div>
          {[1, 2].map((i) => (
            <button key={`today-${i}`} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-left group">
              <MessageSquare size={16} className="text-gray-400 group-hover:text-gray-300 transition-colors" />
              <span className="truncate text-sm flex-1">React Component Setup {i}</span>
            </button>
          ))}
        </div>

        {/* Previous 7 Days */}
        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Previous 7 Days</div>
          {[1, 2, 3].map((i) => (
            <button key={`prev-${i}`} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors text-left group">
              <MessageSquare size={16} className="text-gray-400 group-hover:text-gray-300 transition-colors" />
              <span className="truncate text-sm flex-1">Python Script Debugging {i}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="mb-4 flex justify-center">
          <AdsterraAd slotId="a4e175d89972559cf98a92cbfd41e417" width={300} height={250} type="sidebar" />
        </div>
        
        {/* Plan Usage */}
        <div className="mb-4 px-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Free Plan</span>
            <span>12/50 msgs</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent w-1/4 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
            <Trash2 size={18} />
            <span className="text-sm">Clear conversations</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-amber-400 hover:text-amber-300 transition-colors group">
            <Zap size={18} className="group-hover:fill-amber-400/20" />
            <span className="text-sm font-medium">Upgrade Plan</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors mt-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center shadow-inner">
              <User size={14} className="text-white" />
            </div>
            <span className="text-sm flex-1 text-left font-medium">My Account</span>
            <LogOut size={16} className="text-gray-500 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
