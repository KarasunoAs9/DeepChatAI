import React from 'react';
import { BotIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex gap-3 p-4 w-full">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <BotIcon className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'Вы' : 'DeepChatAI'}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(timestamp)}
          </span>
        </div>
        
        <div className={cn(
          "p-3 rounded-lg border",
          isUser
            ? "bg-blue-50 border-blue-200"
            : "bg-gray-50 border-gray-200"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;