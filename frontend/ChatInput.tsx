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
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
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
                "min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent text-gray-900",
                "placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0",
                "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
              )}
              style={{ height: 'auto' }}
            />
            
            <div className="flex-shrink-0">
              {isLoading ? (
                <Button
                  type="button"
                  onClick={onStop}
                  className="h-10 w-10 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  <StopCircleIcon className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!message.trim()}
                  className="h-10 w-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-lg transition-colors duration-200"
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Нажмите Enter для отправки, Shift+Enter для новой строки
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;