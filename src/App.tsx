import { useState, useCallback, useMemo } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import type { ChatSession } from "./types";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatId, setChatId] = useState(() => Date.now().toString());
  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key") || "";
  });
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('nexxus-sessions', []);
  const [showClearAll, setShowClearAll] = useState(false);

  const currentSession = useMemo(() => sessions.find(s => s.id === chatId) || null, [sessions, chatId]);

  const handleNewChat = useCallback(() => {
    setChatId(Date.now().toString());
    setIsSidebarOpen(false);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setChatId(id);
    setIsSidebarOpen(false);
  }, []);

  const handleSaveSession = useCallback((session: ChatSession) => {
    setSessions(prev => {
      const existing = prev.findIndex(s => s.id === session.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = session;
        return updated;
      }
      return [session, ...prev];
    });
  }, [setSessions]);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (id === chatId) {
      setChatId(Date.now().toString());
    }
  }, [chatId, setSessions]);

  const handleClearAllSessions = useCallback(() => {
    setSessions([]);
    setChatId(Date.now().toString());
    setShowClearAll(false);
  }, [setSessions]);

  const handleTogglePin = useCallback((id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
  }, [setSessions]);

  const handleToggleBookmark = useCallback((id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, bookmarked: !s.bookmarked } : s));
  }, [setSessions]);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
  }, []);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => ({
    'ctrl+n': () => handleNewChat(),
    'ctrl+/': () => setIsSidebarOpen(prev => !prev),
  }), [handleNewChat]);
  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex h-screen w-full bg-surface-50 text-gray-100 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <Sidebar
          onNewChat={handleNewChat}
          sessions={sessions}
          currentChatId={chatId}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClearAll={() => setShowClearAll(true)}
          onTogglePin={handleTogglePin}
          onToggleBookmark={handleToggleBookmark}
        />
      </div>

      <ChatWindow
        key={chatId}
        chatId={chatId}
        apiKey={apiKey}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onSaveSession={handleSaveSession}
        currentSession={currentSession}
        onApiKeyChange={handleApiKeyChange}
      />

      <ConfirmDialog
        open={showClearAll}
        title="Clear All Conversations"
        message="This will permanently delete all your chat history. This action cannot be undone."
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={handleClearAllSessions}
        onCancel={() => setShowClearAll(false)}
      />
    </div>
  );
}

export default App;
