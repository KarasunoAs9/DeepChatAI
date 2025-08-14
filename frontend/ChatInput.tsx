import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, StopCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  onStop?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false, onStop }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
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
    <div className="border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="container max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2 p-3 bg-chat-input rounded-xl border border-border shadow-elegant">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Введите ваше сообщение..."
              className={cn(
                "min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent",
                "placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
                "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              )}
              style={{ height: 'auto' }}
            />
            
            <div className="flex-shrink-0">
              {isLoading ? (
                <Button
                  type="button"
                  onClick={onStop}
                  variant="chat-outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <StopCircleIcon className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!message.trim()}
                  variant="chat"
                  size="icon"
                  className="h-10 w-10"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            Нажмите Enter для отправки, Shift+Enter для новой строки
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;