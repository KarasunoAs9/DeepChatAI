import { useState } from 'react';
import ChatSidebar from '@/ChatSidebar';
import ChatContainer from '@/ChatContainer';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNewChat = () => {
    // Logic for creating a new chat
    console.log('Creating new chat...');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ChatSidebar 
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1">
        <ChatContainer 
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
    </div>
  );
};

export default Index;