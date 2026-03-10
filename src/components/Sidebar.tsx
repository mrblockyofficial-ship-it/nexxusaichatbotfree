import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Plus, User, LogOut, Search, Trash2, Zap, PanelLeftClose, PanelLeftOpen, Pin, Bookmark, Star, Edit3, ChevronDown, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AdsterraAd } from './AdsterraAd';
import type { ChatSession } from '../types';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  currentChatId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onTogglePin: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

// Date grouping helper
const getDateGroup = (timestamp: number): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (date.toDateString() === now.toDateString()) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'Previous 7 Days';
  if (diffDays < 30) return 'Previous 30 Days';
  return 'Older';
};

const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];

export const Sidebar: React.FC<SidebarProps> = ({
  onNewChat,
  sessions,
  currentChatId,
  onSelectSession,
  onDeleteSession,
  onClearAll,
  onTogglePin,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(272);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const isResizing = useRef(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Drag-to-resize sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    const handleMouseMove = (ev: MouseEvent) => {
      if (isResizing.current) {
        const newWidth = Math.max(220, Math.min(400, ev.clientX));
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Touch swipe support for mobile
  const touchStartX = useRef(0);
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff < -80) setIsCollapsed(true);
      if (diff > 80) setIsCollapsed(false);
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenuId) {
      const handler = () => setContextMenuId(null);
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [contextMenuId]);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Filter sessions by search
  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedSessions = filtered.filter(s => s.pinned);
  const bookmarkedSessions = filtered.filter(s => s.bookmarked && !s.pinned);
  const regularSessions = filtered.filter(s => !s.pinned && !(s.bookmarked && !s.pinned));

  // Group regular sessions by date
  const dateGroups: Record<string, ChatSession[]> = {};
  regularSessions.forEach(s => {
    const group = getDateGroup(s.updatedAt);
    if (!dateGroups[group]) dateGroups[group] = [];
    dateGroups[group].push(s);
  });

  const toggleGroupCollapse = (group: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuId(id);
  };

  const handleStartRename = (session: ChatSession) => {
    setRenamingId(session.id);
    setRenameValue(session.title);
    setContextMenuId(null);
  };

  const handleRenameSubmit = () => {
    // Note: we don't have an onRename prop, so renaming is visual-only for now
    setRenamingId(null);
  };

  const chatCount = sessions.length;
  const remainingChats = Math.max(0, 50 - chatCount);

  if (isCollapsed) {
    return (
      <div className="w-16 h-screen glass-panel border-r border-white/[0.06] flex flex-col items-center py-4 bg-surface-50 md:bg-transparent transition-all duration-300">
        <button onClick={() => setIsCollapsed(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors mb-4" title="Expand sidebar" aria-label="Expand sidebar">
          <PanelLeftOpen size={20} />
        </button>
        <button onClick={onNewChat} className="p-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-colors mb-4 shadow-lg shadow-accent/20" title="New Chat" aria-label="New Chat">
          <Plus size={20} />
        </button>
        {/* Mini session indicators */}
        <div className="flex-1 flex flex-col items-center gap-1.5 mt-2 overflow-hidden">
          {sessions.slice(0, 8).map(s => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                s.id === currentChatId
                  ? 'bg-accent/20 text-accent'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]'
              }`}
              title={s.title}
            >
              <MessageSquare size={14} />
            </button>
          ))}
        </div>
        <div className="mt-auto">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shadow-inner" title="My Account">
            <User size={14} className="text-white" />
          </div>
        </div>
      </div>
    );
  }

  const renderSession = (session: ChatSession) => {
    const isRenaming = renamingId === session.id;

    return (
      <motion.div
        key={session.id}
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -12 }}
        transition={{ duration: 0.2 }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-gray-400 hover:text-white transition-all duration-200 text-left group cursor-pointer ${
          session.id === currentChatId ? 'bg-white/[0.06] text-white' : ''
        }`}
        role="button"
        tabIndex={0}
        onClick={() => !isRenaming && onSelectSession(session.id)}
        onKeyDown={e => { if (e.key === 'Enter' && !isRenaming) onSelectSession(session.id); }}
        onContextMenu={e => handleContextMenu(e, session.id)}
        onDoubleClick={() => handleStartRename(session)}
      >
        <MessageSquare size={15} className={session.id === currentChatId ? 'text-accent flex-shrink-0' : 'text-gray-500 group-hover:text-gray-400 transition-colors flex-shrink-0'} />
        {isRenaming ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') setRenamingId(null);
              }}
              onBlur={handleRenameSubmit}
              className="flex-1 min-w-0 bg-white/[0.06] rounded-lg px-2 py-0.5 text-sm text-white outline-none border border-accent/30"
              onClick={e => e.stopPropagation()}
            />
          </div>
        ) : (
          <span className="truncate text-[13px] flex-1 min-w-0">{session.title}</span>
        )}
        {!isRenaming && (
          <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(session.id); }}
              className={`p-1 rounded-lg transition-colors ${session.pinned ? 'text-amber-400' : 'text-gray-600 hover:text-gray-300'}`}
              title="Pin"
              aria-label="Pin chat"
            >
              <Pin size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
              className="p-1 text-gray-600 hover:text-red-400 rounded-lg transition-colors"
              title="Delete"
              aria-label="Delete chat"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  const sectionHeaderCallback = (icon: React.ReactNode, label: string, count: number, group?: string) => {
    const isCollapsible = !!group;
    const isGroupCollapsed = group ? collapsedGroups.has(group) : false;

    return (
      <button
        onClick={() => group && toggleGroupCollapse(group)}
        className={`flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-2 py-1 w-full ${
          isCollapsible ? 'hover:text-gray-400 transition-colors cursor-pointer' : 'cursor-default'
        }`}
      >
        {isCollapsible && (isGroupCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />)}
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-[10px] text-gray-700 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">{count}</span>
      </button>
    );
  };

  return (
    <div
      className="h-screen glass-panel border-r border-white/[0.06] flex flex-col bg-surface-50 md:bg-transparent transition-all duration-300 relative"
      style={{ width: sidebarWidth }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent/30 transition-colors z-10"
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div className="p-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide text-[15px]">Nexxus AI</span>
            <span className="text-[10px] font-mono text-gray-600 bg-white/[0.04] px-1.5 py-0.5 rounded-md">{chatCount}</span>
          </div>
          <button onClick={() => setIsCollapsed(true)} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors hidden md:block" title="Close sidebar" aria-label="Collapse sidebar">
            <PanelLeftClose size={16} />
          </button>
        </div>
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white py-2.5 px-4 rounded-xl transition-colors font-medium shadow-lg shadow-accent/20 text-[13px]"
          aria-label="Start new chat"
        >
          <Plus size={16} />
          New Chat
        </button>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-9 pr-3 py-2 text-[13px] text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent/30 transition-all"
            aria-label="Search chats"
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3" role="navigation" aria-label="Chat history">
        <AnimatePresence mode="popLayout">
          {pinnedSessions.length > 0 && (
            <div>
              {sectionHeaderCallback(<Pin size={11} />, 'Pinned', pinnedSessions.length)}
              {pinnedSessions.map(renderSession)}
            </div>
          )}

          {bookmarkedSessions.length > 0 && (
            <div>
              {sectionHeaderCallback(<Star size={11} />, 'Bookmarked', bookmarkedSessions.length)}
              {bookmarkedSessions.map(renderSession)}
            </div>
          )}

          {groupOrder.map(group => {
            const groupSessions = dateGroups[group];
            if (!groupSessions || groupSessions.length === 0) return null;
            const isGroupCollapsed = collapsedGroups.has(group);

            return (
              <div key={group}>
                {sectionHeaderCallback(null, group, groupSessions.length, group)}
                {!isGroupCollapsed && groupSessions.map(renderSession)}
              </div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && sessions.length === 0 && (
          <div className="text-center text-gray-600 text-[13px] py-8">
            No conversations yet.<br />Start a new chat!
          </div>
        )}

        {filtered.length === 0 && sessions.length > 0 && searchQuery && (
          <div className="text-center text-gray-600 text-[13px] py-8">
            No matching chats found.
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenuId && (
        <div
          className="fixed z-[200] glass-panel-elevated rounded-xl py-1.5 min-w-[160px] shadow-elevation-4 border border-white/[0.08]"
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
          onClick={e => e.stopPropagation()}
        >
          {(() => {
            const session = sessions.find(s => s.id === contextMenuId);
            if (!session) return null;
            return (
              <>
                <button
                  onClick={() => handleStartRename(session)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Edit3 size={14} /> Rename
                </button>
                <button
                  onClick={() => { onTogglePin(session.id); setContextMenuId(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Pin size={14} /> {session.pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={() => { onToggleBookmark(session.id); setContextMenuId(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-gray-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Bookmark size={14} /> {session.bookmarked ? 'Unbookmark' : 'Bookmark'}
                </button>
                <div className="border-t border-white/[0.06] my-1" />
                <button
                  onClick={() => { onDeleteSession(session.id); setContextMenuId(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-white/[0.06] bg-surface-0/50">
        <div className="mb-4 flex justify-center">
          <AdsterraAd slotId="a4e175d89972559cf98a92cbfd41e417" width={300} height={250} type="sidebar" />
        </div>

        <div className="mb-4 px-1">
          <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
            <span>Free Plan</span>
            <span className="font-mono">{remainingChats} remaining</span>
          </div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-accent to-violet-500"
              style={{ width: `${Math.min(100, (chatCount / 50) * 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-0.5">
          <button
            onClick={onClearAll}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-gray-400 hover:text-white transition-colors"
            aria-label="Clear all conversations"
          >
            <Trash2 size={16} />
            <span className="text-[13px]">Clear conversations</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-500/[0.06] text-amber-400 hover:text-amber-300 transition-colors group">
            <Zap size={16} className="group-hover:fill-amber-400/20" />
            <span className="text-[13px] font-medium">Upgrade Plan</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.04] text-gray-300 hover:text-white transition-colors mt-1">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shadow-inner">
              <User size={13} className="text-white" />
            </div>
            <span className="text-[13px] flex-1 text-left font-medium">My Account</span>
            <LogOut size={14} className="text-gray-600 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
