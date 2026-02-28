import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { ChatWindow } from "./components/ChatWindow";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatId, setChatId] = useState(Date.now().toString());
  const [apiKey] = useState(() => {
    return import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem("openrouter_api_key") || "";
  });

  const handleNewChat = () => {
    setChatId(Date.now().toString());
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-navy-900 text-gray-100 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <Sidebar onNewChat={handleNewChat} />
      </div>

      <ChatWindow key={chatId} apiKey={apiKey} onOpenSidebar={() => setIsSidebarOpen(true)} />
    </div>
  );
}

export default App;
