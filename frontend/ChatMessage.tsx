import React from 'react';
import { HeartIcon, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp, isThinking, isStreaming }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex gap-4 p-6 w-full">
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
        {isUser ? (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-secondary/80 flex items-center justify-center shadow-sm">
            <UserIcon className="h-5 w-5 text-secondary-foreground" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-sm breathing-animation">
            <HeartIcon className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-foreground">
            {isUser ? 'Вы' : 'Психолог'}
          </span>
          {isThinking && (
            <span className="text-xs text-primary flex items-center gap-1">
              <div className="w-1 h-1 bg-primary rounded-full gentle-pulse"></div>
              размышляю...
            </span>
          )}
          {isStreaming && (
            <span className="text-xs text-primary flex items-center gap-1">
              <div className="w-1 h-1 bg-primary rounded-full gentle-pulse"></div>
              отвечаю...
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>
        
        <div className={cn(
          "p-4 rounded-2xl border transition-all duration-300",
          isUser
            ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 ml-4"
            : "bg-card/60 border-border/50 backdrop-blur-sm",
          (isThinking || isStreaming) && "bg-primary/5 border-primary/20"
        )}>
          {isThinking ? (
            <div className="flex gap-2 items-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
              <span className="text-sm text-primary ml-2">{message}</span>
            </div>
          ) : (
            <p className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap text-foreground",
              isStreaming && "after:content-['|'] after:animate-pulse after:ml-1 after:text-primary"
            )}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;