import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MenuIcon, BotIcon, LogOut } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import ChatMessage from '@/ChatMessage';
import ChatInput from '@/ChatInput';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatContainerProps {
  onToggleSidebar: () => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ onToggleSidebar }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Привет! Я DeepChatAI, ваш интеллектуальный помощник. Чем могу помочь?',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { signOut, user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Спасибо за ваш вопрос! Вы написали: "${content}". Это отличный пример взаимодействия с AI-ассистентом. Я готов помочь вам с различными задачами: ответить на вопросы, помочь с творческими проектами, объяснить сложные концепции или просто поболтать. Что бы вы хотели обсудить дальше?`,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleStopGeneration = () => {
    setIsLoading(false);
  };

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
          <h1 className="text-lg font-semibold text-gray-900">Новый чат</h1>
          <p className="text-sm text-gray-500">
            Ведите диалог с DeepChatAI{user ? ` • ${user.username}` : ''}
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={signOut} className="rounded-lg">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-6 max-w-md mx-auto px-6">
                  <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Добро пожаловать в DeepChatAI</h2>
                    <p className="text-gray-600 leading-relaxed">
                      Начните разговор, введя сообщение ниже
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
                  />
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 p-4 w-full">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <BotIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">DeepChatAI</span>
                        <span className="text-xs text-gray-500">печатает...</span>
                      </div>
                      <div className="p-3 rounded-lg border bg-gray-50 border-gray-200">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onStop={handleStopGeneration}
      />
    </div>
  );
};

export default ChatContainer;