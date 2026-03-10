import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Search, Trash2, Printer, Share, Copy, Download, FileJson, FileText, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';

interface MenuItemProps {
  icon: React.FC<{ size: number; className?: string }>;
  label: string;
  shortcut?: string;
  onClick: () => void;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, shortcut, onClick, danger }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
      danger
        ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
        : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'
    }`}
  >
    <Icon size={15} className="flex-shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    {shortcut && (
      <span className="text-[10px] text-gray-600 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded">{shortcut}</span>
    )}
  </button>
);

interface HeaderActionsMenuProps {
  onSearch: () => void;
  onClearChat: () => void;
  onPrint: () => void;
  onShareChat: () => void;
  onCopyConversation: () => void;
  onExportTxt: () => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  hasMessages: boolean;
}

export const HeaderActionsMenu: React.FC<HeaderActionsMenuProps> = ({
  onSearch,
  onClearChat,
  onPrint,
  onShareChat,
  onCopyConversation,
  onExportTxt,
  onExportJson,
  onExportMarkdown,
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  isFullscreen,
  hasMessages,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
        title="More actions"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 glass-panel-elevated rounded-xl py-1.5 z-50 shadow-elevation-4 border border-white/[0.08]">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">View</div>
          <MenuItem icon={ZoomIn} label="Zoom In" onClick={() => { onZoomIn(); close(); }} />
          <MenuItem icon={ZoomOut} label="Zoom Out" onClick={() => { onZoomOut(); close(); }} />
          <MenuItem icon={isFullscreen ? Minimize : Maximize} label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} onClick={() => { onToggleFullscreen(); close(); }} />

          {hasMessages && (
            <>
              <div className="border-t border-white/[0.06] my-1.5" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Chat</div>
              <MenuItem icon={Search} label="Search Messages" shortcut="Ctrl+F" onClick={() => { onSearch(); close(); }} />
              <MenuItem icon={Copy} label="Copy Conversation" onClick={() => { onCopyConversation(); close(); }} />
              <MenuItem icon={Share} label="Share Chat" onClick={() => { onShareChat(); close(); }} />
              <MenuItem icon={Printer} label="Print" onClick={() => { onPrint(); close(); }} />

              <div className="border-t border-white/[0.06] my-1.5" />
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Export</div>
              <MenuItem icon={Download} label="Export as TXT" onClick={() => { onExportTxt(); close(); }} />
              <MenuItem icon={FileJson} label="Export as JSON" onClick={() => { onExportJson(); close(); }} />
              <MenuItem icon={FileText} label="Export as Markdown" onClick={() => { onExportMarkdown(); close(); }} />

              <div className="border-t border-white/[0.06] my-1.5" />
              <MenuItem icon={Trash2} label="Clear Chat" onClick={() => { onClearChat(); close(); }} danger />
            </>
          )}
        </div>
      )}
    </div>
  );
};
