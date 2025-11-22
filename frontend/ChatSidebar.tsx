import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusIcon, HeartIcon, XIcon, MessageCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';
import { getUserChats, createNewChat, renameChat, deleteChat } from '@/lib/api';
import { WebSocketChatManager } from '@/lib/websocket';
import ChatActions from '@/components/ChatActions';

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
  onChatDeleted?: (chatId: number) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onChatSelect,
  currentChatId,
  onChatDeleted
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

  const handleRenameChat = async (chatId: number, newName: string) => {
    if (!token) return;
    
    try {
      await renameChat(chatId, newName, token);
      // Обновляем локальное состояние
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, name: newName } : chat
        )
      );
    } catch (error) {
      console.error('Ошибка переименования чата:', error);
      throw error;
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    if (!token) return;
    
    try {
      await deleteChat(chatId, token);
      // Удаляем из локального состояния
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      // Уведомляем родительский компонент
      if (onChatDeleted) {
        onChatDeleted(chatId);
      }
    } catch (error) {
      console.error('Ошибка удаления чата:', error);
      throw error;
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
        "fixed top-0 left-0 h-full bg-sidebar-background border-r border-sidebar-border z-50 transition-transform duration-500 lg:relative lg:translate-x-0 psychology-card",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "w-72"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center breathing-animation">
              <HeartIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">
                МойПсихолог
              </h1>
              <p className="text-xs text-sidebar-foreground/70">Ваш помощник в трудных ситуациях</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden hover:bg-sidebar-accent rounded-full"
          >
            <XIcon className="h-4 w-4 text-sidebar-foreground/70" />
          </Button>
        </div>

        {/* New Session Button */}
        <div className="p-6">
          <Button
            onClick={handleNewChat}
            disabled={creatingChat}
            className="w-full justify-start gap-3 calming-button disabled:opacity-50 disabled:hover:scale-100"
          >
            <PlusIcon className="h-4 w-4" />
            {creatingChat ? 'Создание сессии...' : 'Новая сессия'}
          </Button>
        </div>

        {/* Session History */}
        <div className="px-6">
          <h2 className="text-xs font-medium text-sidebar-foreground/60 mb-4 uppercase tracking-wider">История сессий</h2>
          <ScrollArea className="h-[calc(100vh-240px)] psychology-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3"></div>
                <div className="text-sm text-sidebar-foreground/60">Загрузка сессий...</div>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircleIcon className="h-6 w-6 text-primary/60" />
                </div>
                <div className="text-sm text-sidebar-foreground/70 mb-2">Нет сессий</div>
                <div className="text-xs text-sidebar-foreground/50">Начните первую беседу</div>
              </div>
            ) : (
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl hover:bg-sidebar-accent transition-all duration-300 group",
                      currentChatId === chat.id && "bg-primary/10 border border-primary/20 shadow-sm"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        currentChatId === chat.id ? "bg-primary gentle-pulse" : "bg-sidebar-foreground/30 group-hover:bg-primary/50"
                      )} />
                    </div>
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onChatSelect(chat.id, chat.name)}
                    >
                      <p className="text-sm text-sidebar-foreground truncate font-medium">
                        {chat.name}
                      </p>
                      <p className="text-xs text-sidebar-foreground/50 mt-0.5">
                        {formatTime(chat.timestamp)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ChatActions
                        chatId={chat.id}
                        chatName={chat.name}
                        onRename={handleRenameChat}
                        onDelete={handleDeleteChat}
                        isCurrentChat={currentChatId === chat.id}
                      />
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