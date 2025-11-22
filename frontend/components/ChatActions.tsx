import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  EditIcon, 
  TrashIcon, 
  CheckIcon, 
  XIcon,
  MoreHorizontalIcon
} from 'lucide-react';

interface ChatActionsProps {
  chatId: number;
  chatName: string;
  onRename: (chatId: number, newName: string) => Promise<void>;
  onDelete: (chatId: number) => Promise<void>;
  isCurrentChat: boolean;
  className?: string;
}

const ChatActions: React.FC<ChatActionsProps> = ({
  chatId,
  chatName,
  onRename,
  onDelete,
  isCurrentChat,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(chatName);
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!newName.trim() || newName === chatName) {
      setIsEditing(false);
      setNewName(chatName);
      return;
    }

    setIsLoading(true);
    try {
      await onRename(chatId, newName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка переименования:', error);
      setNewName(chatName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить эту сессию? Это действие нельзя отменить.')) {
      setIsLoading(true);
      try {
        await onDelete(chatId);
      } catch (error) {
        console.error('Ошибка удаления:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewName(chatName);
    }
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-background/60 border border-border/50 rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          autoFocus
          disabled={isLoading}
        />
        <Button
          size="sm"
          onClick={handleRename}
          disabled={isLoading}
          className="h-6 w-6 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
        >
          <CheckIcon className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setNewName(chatName);
          }}
          disabled={isLoading}
          className="h-6 w-6 p-0 rounded-md"
        >
          <XIcon className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowActions(!showActions)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-sidebar-accent rounded-md"
      >
        <MoreHorizontalIcon className="h-3 w-3 text-sidebar-foreground/60" />
      </Button>

      {showActions && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowActions(false)}
          />
          
          {/* Actions Menu */}
          <div className="absolute right-0 top-6 z-20 bg-card border border-border/50 rounded-lg shadow-lg py-1 min-w-[120px]">
            <button
              onClick={() => {
                setIsEditing(true);
                setShowActions(false);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors duration-200 disabled:opacity-50"
            >
              <EditIcon className="h-3 w-3" />
              Переименовать
            </button>
            
            <button
              onClick={handleDelete}
              disabled={isLoading || isCurrentChat}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors duration-200",
                isCurrentChat 
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-destructive hover:bg-destructive/10"
              )}
              title={isCurrentChat ? "Нельзя удалить активную сессию" : "Удалить сессию"}
            >
              <TrashIcon className="h-3 w-3" />
              Удалить
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatActions;
