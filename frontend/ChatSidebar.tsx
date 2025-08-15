import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, MessageSquareIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';
import { getUserChats, createNewChat } from '@/lib/api';
import { WebSocketChatManager } from '@/lib/websocket';

interface ChatHistory {
  id: number;
  name: string;
  timestamp?: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onChatSelect: (chatId: number, chatName: string) => void;
  currentChatId?: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onChatSelect,
  currentChatId 
}) => {
  const { token } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  const loadChats = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const chats = await getUserChats(token);
      setChatHistory(chats.map((chat: any) => ({
        id: chat.id,
        name: chat.name,
        timestamp: new Date() // API не возвращает timestamp, используем текущее время
      })));
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [token]);

  const handleNewChat = async () => {
    if (!token || creatingChat) return;

    setCreatingChat(true);
    try {
      // Используем WebSocket для создания чата
      const wsManager = new WebSocketChatManager(
        token,
        () => {},
        (error) => console.error('WebSocket error:', error),
        () => {}
      );

      const chatId = await wsManager.createNewChat();
      if (chatId) {
        // Обновляем список чатов
        await loadChats();
        // Переключаемся на новый чат
        onChatSelect(chatId, 'Новый чат');
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      // Fallback на REST API
      try {
        const result = await createNewChat(token);
        if (result.chat_id) {
          await loadChats();
          onChatSelect(result.chat_id, 'Новый чат');
        }
      } catch (restError) {
        console.error('Failed to create chat via REST:', restError);
      }
    } finally {
      setCreatingChat(false);
    }
  };

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return 'Недавно';
    
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
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">
            DeepChatAI
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden hover:bg-gray-100"
          >
            <XIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            disabled={creatingChat}
            className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            {creatingChat ? 'Создание...' : 'Новый чат'}
          </Button>
        </div>

        {/* Chat History */}
        <div className="px-4">
          <h2 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">История</h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Загрузка...</div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-sm text-gray-500 mb-2">Нет чатов</div>
                <div className="text-xs text-gray-400">Создайте первый чат</div>
              </div>
            ) : (
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onChatSelect(chat.id, chat.name)}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-150",
                      currentChatId === chat.id && "bg-blue-50 border border-blue-200"
                    )}
                  >
                    <MessageSquareIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {chat.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(chat.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;