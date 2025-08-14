import React, { useState } from 'react';
import ChatSidebar from '@/components/ChatSidebar';
import ChatContainer from '@/components/ChatContainer';

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
    <div className="flex h-screen bg-chat-background">
      <ChatSidebar 
        isOpen={sidebarOpen}
        onToggle={handleToggleSidebar}
        onNewChat={handleNewChat}
      />
      
      <div className="flex-1 lg:ml-0">
        <ChatContainer 
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  );
};

export default Index;