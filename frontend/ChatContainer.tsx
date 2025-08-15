import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MenuIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import ChatMessage from '@/ChatMessage';
import ChatInput from '@/ChatInput';
import { WebSocketChatManager, type ChatMessage as WSChatMessage } from '@/lib/websocket';
import { getChatHistory } from '@/lib/api';

interface ChatContainerProps {
  onToggleSidebar: () => void;
  currentChatId?: number;
  chatName?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  onToggleSidebar, 
  currentChatId,
  chatName 
}) => {
  const { token, signOut, user } = useAuth();
  const [messages, setMessages] = useState<WSChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [wsManager, setWsManager] = useState<WebSocketChatManager | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Инициализация WebSocket менеджера
  useEffect(() => {
    if (!token) return;

    const manager = new WebSocketChatManager(
      token,
      (message) => {
        setMessages(prev => {
          // Проверяем, не дублируется ли сообщение с историей
          const existingMessage = prev.find(m => m.id === message.id);
          if (existingMessage && !message.isThinking && !message.isStreaming) {
            return prev; // Не добавляем дубликат
          }
          
          // Удаляем предыдущие thinking/streaming сообщения если пришел финальный ответ
          if (!message.isThinking && !message.isStreaming) {
            const filtered = prev.filter(m => !m.isThinking && !m.isStreaming);
            return [...filtered, message];
          }
          
          // Заменяем thinking сообщения
          if (message.isThinking) {
            const filtered = prev.filter(m => !m.isThinking);
            return [...filtered, message];
          }
          
          // Обновляем streaming сообщения
          if (message.isStreaming) {
            const filtered = prev.filter(m => !m.isStreaming);
            return [...filtered, message];
          }
          
          return [...prev, message];
        });
      },
      (errorMsg) => {
        setError(errorMsg);
        setTimeout(() => setError(null), 5000);
      },
      (chatId) => {
        setIsConnected(true);
        console.log('Connected to chat:', chatId);
      }
    );

    setWsManager(manager);

    return () => {
      manager.disconnect();
    };
  }, [token]);

  // Подключение к чату
  useEffect(() => {
    if (!wsManager || !currentChatId) return;

    setMessages([]);
    setIsConnected(false);

    // Загружаем историю чата
    const loadHistory = async () => {
      if (!token) return;
      
      setIsLoadingHistory(true);
      setError(null);
      
      try {
        const history = await getChatHistory(currentChatId, token);
        console.log('Loaded chat history:', history);
        
        if (Array.isArray(history) && history.length > 0) {
          const convertedMessages: WSChatMessage[] = history.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.role === 'user',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
          }));
          setMessages(convertedMessages);
        } else {
          // Если история пуста, устанавливаем пустой массив
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        setError('Не удалось загрузить историю чата');
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
    wsManager.connect(currentChatId);

    return () => {
      wsManager.disconnect();
      setIsConnected(false);
    };
  }, [wsManager, currentChatId, token]);

  const handleSendMessage = (content: string) => {
    if (!wsManager || !wsManager.isConnected()) {
      setError('Нет соединения с сервером');
      return;
    }

    wsManager.sendMessage(content);
  };

  const handleStopGeneration = () => {
    // TODO: Implement stop generation
    console.log('Stop generation requested');
  };

  const isLoading = messages.some(m => m.isThinking || m.isStreaming);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden hover:bg-gray-100"
        >
          <MenuIcon className="h-4 w-4 text-gray-600" />
        </Button>
        
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900">
            {chatName || (currentChatId ? `Чат ${currentChatId}` : 'Выберите чат')}
          </h1>
          <p className="text-sm text-gray-500">
            {!currentChatId ? (
              <>Выберите чат для начала{user ? ` • ${user.username}` : ''}</>
            ) : isConnected ? (
              <>Подключено{user ? ` • ${user.username}` : ''}</>
            ) : (
              'Подключение...'
            )}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={signOut} className="rounded-lg">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto">
            {!currentChatId ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-6 max-w-md mx-auto px-6">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Добро пожаловать в DeepChatAI</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Выберите чат в боковой панели или создайте новый
                    </p>
                  </div>
                </div>
              </div>
            ) : isLoadingHistory ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-6 max-w-md mx-auto px-6">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Загружаем историю</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Пожалуйста, подождите...
                    </p>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-6 max-w-md mx-auto px-6">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Начните беседу</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Введите сообщение ниже, чтобы начать диалог с AI
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    isThinking={message.isThinking}
                    isStreaming={message.isStreaming}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      {currentChatId && (
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isLoadingHistory}
          onStop={handleStopGeneration}
          disabled={!isConnected || isLoadingHistory}
        />
      )}
    </div>
  );
};

export default ChatContainer;