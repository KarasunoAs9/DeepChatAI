import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MenuIcon, LogOut, HeartHandshakeIcon, SparklesIcon, ActivityIcon, WindIcon } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import ChatMessage from '@/ChatMessage';
import ChatInput from '@/ChatInput';
import MoodTracker from '@/components/MoodTracker';
import BreathingExercise from '@/components/BreathingExercise';
import { WebSocketChatManager, type ChatMessage as WSChatMessage } from '@/lib/websocket';
import { getChatHistory } from '@/lib/api';
import { cn } from '@/lib/utils';

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
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | undefined>();
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

    // Добавляем информацию о настроении к сообщению, если оно выбрано
    let messageContent = content;
    if (selectedMood) {
      messageContent = `[Настроение: ${selectedMood}] ${content}`;
    }

    wsManager.sendMessage(messageContent);
  };

  const handleStopGeneration = () => {
    // TODO: Implement stop generation
    console.log('Stop generation requested');
  };

  const handleMoodSelect = (mood: any) => {
    setSelectedMood(mood.id);
    // Можно автоматически отправить информацию о настроении психологу
    if (wsManager && wsManager.isConnected()) {
      wsManager.sendMessage(`Мое текущее настроение: ${mood.label} - ${mood.description}`);
    }
  };

  const isLoading = messages.some(m => m.isThinking || m.isStreaming);

  return (
    <div className="flex flex-col h-screen" style={{background: 'var(--chat-background)'}}>
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="lg:hidden hover:bg-accent rounded-full"
        >
          <MenuIcon className="h-4 w-4 text-foreground/70" />
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-foreground">
              {chatName || (currentChatId ? `Сессия ${currentChatId}` : 'Добро пожаловать')}
            </h1>
            {isConnected && currentChatId && (
              <div className="w-2 h-2 bg-primary rounded-full gentle-pulse" />
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {!currentChatId ? (
              <>
                <HeartHandshakeIcon className="h-4 w-4" />
                Я здесь, чтобы поддержать вас{user ? ` • ${user.username}` : ''}
              </>
            ) : isConnected ? (
              <>
                <SparklesIcon className="h-4 w-4" />
                Готов к беседе{user ? ` • ${user.username}` : ''}
              </>
            ) : (
              'Подключение к сессии...'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentChatId && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMoodTracker(!showMoodTracker)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  showMoodTracker && "bg-primary/10 border-primary/30"
                )}
              >
                <ActivityIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowBreathingExercise(!showBreathingExercise)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  showBreathingExercise && "bg-primary/10 border-primary/30"
                )}
              >
                <WindIcon className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut} 
            className="rounded-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 backdrop-blur-sm">
          <p className="text-sm text-destructive flex items-center gap-2">
            <span className="w-2 h-2 bg-destructive rounded-full"></span>
            {error}
          </p>
        </div>
      )}

      {/* Psychology Tools */}
      {currentChatId && (showMoodTracker || showBreathingExercise) && (
        <div className="border-b border-border/50 bg-card/60 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {showMoodTracker && (
                <MoodTracker
                  onMoodSelect={handleMoodSelect}
                  selectedMood={selectedMood}
                />
              )}
              {showBreathingExercise && (
                <BreathingExercise />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full psychology-scrollbar" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto">
            {!currentChatId ? (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center space-y-8 max-w-lg mx-auto px-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center breathing-animation warm-glow">
                    <HeartHandshakeIcon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold text-foreground mb-4">Добро пожаловать в МойПсихолог</h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      Я здесь, чтобы поддержать вас в трудные моменты. Выберите сессию в боковой панели или создайте новую для начала беседы.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground/70 mt-6">
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Конфиденциально</span>
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Безопасно</span>
                      <span className="w-1 h-1 bg-primary/50 rounded-full"></span>
                      <span>Поддерживающе</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : isLoadingHistory ? (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center space-y-8 max-w-lg mx-auto px-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-3">Подготавливаем сессию</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Загружаем историю наших предыдущих бесед...
                    </p>
                  </div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center space-y-8 max-w-lg mx-auto px-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center breathing-animation">
                    <SparklesIcon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-foreground mb-3">Расскажите, что вас беспокоит</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Я готов выслушать и поддержать вас. Поделитесь своими мыслями и чувствами — это безопасное пространство.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
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