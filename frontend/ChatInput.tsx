import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, StopCircleIcon, HeartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false, onStop, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-4 p-4 bg-background/60 rounded-2xl border border-border/50 psychology-card">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Подключение к сессии..." : "Поделитесь своими мыслями и чувствами..."}
              disabled={disabled}
              className={cn(
                "min-h-[44px] max-h-[140px] resize-none border-0 bg-transparent text-foreground text-base",
                "placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0",
                "psychology-scrollbar",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ height: 'auto' }}
            />
            
            <div className="flex-shrink-0">
              {isLoading ? (
                <Button
                  type="button"
                  onClick={onStop}
                  className="h-12 w-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <StopCircleIcon className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!message.trim() || disabled}
                  className="h-12 w-12 calming-button disabled:bg-muted disabled:text-muted-foreground disabled:hover:scale-100 disabled:shadow-none"
                >
                  <SendIcon className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1">
              <HeartIcon className="h-3 w-3" />
              <span>Безопасное пространство</span>
            </div>
            <span>•</span>
            <span>Enter - отправить, Shift+Enter - новая строка</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;