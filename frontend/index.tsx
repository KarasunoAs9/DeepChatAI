import { useState } from 'react';
import ChatSidebar from '@/ChatSidebar';
import ChatContainer from '@/ChatContainer';
import LoginPage from '@/LoginPage';
import { useAuth } from '@/AuthContext';

const Index = () => {
  const { token, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    // Logic for creating a new chat
    console.log('Creating new chat...');
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
        onNewChat={handleNewChat}
      />

      <div className="flex-1">
        <ChatContainer onToggleSidebar={handleToggleSidebar} />
      </div>
    </div>
  );
};

export default Index;