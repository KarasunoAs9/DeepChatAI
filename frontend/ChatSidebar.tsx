import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, MessageSquareIcon, MenuIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle, onNewChat }) => {
  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: 'Объяснение квантовой физики', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
    { id: '2', title: 'Рецепт итальянской пасты', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
    { id: '3', title: 'Основы программирования на Python', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    { id: '4', title: 'Планирование путешествия в Японию', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
  ]);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}д назад`;
    if (hours > 0) return `${hours}ч назад`;
    return 'Только что';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full bg-chat-sidebar border-r border-border z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
            DeepChatAI
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={onNewChat}
            variant="chat"
            className="w-full justify-start gap-3"
          >
            <PlusIcon className="h-4 w-4" />
            Новый чат
          </Button>
        </div>

        {/* Chat History */}
        <div className="px-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">История</h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors duration-200"
                >
                  <MessageSquareIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(chat.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;