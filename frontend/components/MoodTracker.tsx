import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  SmileIcon, 
  FrownIcon, 
  MehIcon, 
  HeartIcon, 
  CloudRainIcon,
  SunIcon,
  ZapIcon,
  Leaf
} from 'lucide-react';

interface MoodOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const moodOptions: MoodOption[] = [
  {
    id: 'excellent',
    label: 'Отлично',
    icon: <SunIcon className="h-5 w-5" />,
    color: 'text-yellow-500',
    description: 'Чувствую себя прекрасно'
  },
  {
    id: 'good',
    label: 'Хорошо',
    icon: <SmileIcon className="h-5 w-5" />,
    color: 'text-green-500',
    description: 'Настроение позитивное'
  },
  {
    id: 'okay',
    label: 'Нормально',
    icon: <MehIcon className="h-5 w-5" />,
    color: 'text-blue-500',
    description: 'Обычное состояние'
  },
  {
    id: 'anxious',
    label: 'Тревожно',
    icon: <ZapIcon className="h-5 w-5" />,
    color: 'text-orange-500',
    description: 'Чувствую беспокойство'
  },
  {
    id: 'sad',
    label: 'Грустно',
    icon: <CloudRainIcon className="h-5 w-5" />,
    color: 'text-blue-600',
    description: 'Печальное настроение'
  },
  {
    id: 'bad',
    label: 'Плохо',
    icon: <FrownIcon className="h-5 w-5" />,
    color: 'text-red-500',
    description: 'Трудный день'
  }
];

interface MoodTrackerProps {
  onMoodSelect: (mood: MoodOption) => void;
  selectedMood?: string;
  className?: string;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ 
  onMoodSelect, 
  selectedMood,
  className 
}) => {
  const [hoveredMood, setHoveredMood] = useState<string | null>(null);

  return (
    <div className={cn("psychology-card p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
          <HeartIcon className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Как вы себя чувствуете?</h3>
          <p className="text-sm text-muted-foreground">
            Выберите ваше текущее настроение
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {moodOptions.map((mood) => (
          <Button
            key={mood.id}
            variant="ghost"
            onClick={() => onMoodSelect(mood)}
            onMouseEnter={() => setHoveredMood(mood.id)}
            onMouseLeave={() => setHoveredMood(null)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 h-auto rounded-xl border transition-all duration-300",
              selectedMood === mood.id
                ? "bg-primary/10 border-primary/30 shadow-md"
                : "bg-background/50 border-border/50 hover:bg-primary/5 hover:border-primary/20",
              "hover:scale-105 hover:shadow-md"
            )}
          >
            <div className={cn(
              "transition-all duration-300",
              selectedMood === mood.id || hoveredMood === mood.id
                ? mood.color
                : "text-muted-foreground"
            )}>
              {mood.icon}
            </div>
            <div className="text-center">
              <div className={cn(
                "text-sm font-medium transition-colors duration-300",
                selectedMood === mood.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}>
                {mood.label}
              </div>
              {(selectedMood === mood.id || hoveredMood === mood.id) && (
                <div className="text-xs text-muted-foreground/70 mt-1">
                  {mood.description}
                </div>
              )}
            </div>
          </Button>
        ))}
      </div>

      {selectedMood && (
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              Спасибо за открытость. Это поможет мне лучше понять ваше состояние.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
