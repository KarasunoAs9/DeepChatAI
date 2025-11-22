import { useState } from 'react';
import ChatSidebar from '@/ChatSidebar';
import ChatContainer from '@/ChatContainer';
import LoginPage from '@/LoginPage';
import { useAuth } from '@/AuthContext';

const Index = () => {
  const { token, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | undefined>();
  const [currentChatName, setCurrentChatName] = useState<string | undefined>();

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChatSelect = (chatId: number, chatName: string) => {
    setCurrentChatId(chatId);
    setCurrentChatName(chatName);
    // Закрываем сайдбар на мобильных
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleChatDeleted = (deletedChatId: number) => {
    // Если удален текущий чат, сбрасываем выбор
    if (currentChatId === deletedChatId) {
      setCurrentChatId(undefined);
      setCurrentChatName(undefined);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-600">Загрузка…</div>
  }

  if (!token) {
    return <LoginPage onSuccess={() => { /* после входа Index перерисуется через контекст */ }} />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        onChatSelect={handleChatSelect}
        currentChatId={currentChatId}
        onChatDeleted={handleChatDeleted}
      />

      <div className="flex-1">
        <ChatContainer 
          onToggleSidebar={handleToggleSidebar}
          currentChatId={currentChatId}
          chatName={currentChatName}
        />
      </div>
    </div>
  );
};

export default Index;