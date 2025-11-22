import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  PlayIcon, 
  PauseIcon, 
  RotateCcwIcon,
  WindIcon,
  HeartIcon
} from 'lucide-react';

interface BreathingExerciseProps {
  className?: string;
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ className }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycle, setCycle] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const phaseConfig = {
    inhale: { duration: 4, next: 'hold' as Phase, text: 'Вдох', color: 'text-blue-500' },
    hold: { duration: 7, next: 'exhale' as Phase, text: 'Задержка', color: 'text-purple-500' },
    exhale: { duration: 8, next: 'pause' as Phase, text: 'Выдох', color: 'text-green-500' },
    pause: { duration: 1, next: 'inhale' as Phase, text: 'Пауза', color: 'text-gray-500' }
  };

  const currentPhase = phaseConfig[phase];

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const nextPhase = currentPhase.next;
            setPhase(nextPhase);
            if (nextPhase === 'inhale') {
              setCycle(c => c + 1);
            }
            return phaseConfig[nextPhase].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimeLeft(4);
    setCycle(0);
  };

  const getCircleScale = () => {
    const progress = (currentPhase.duration - timeLeft) / currentPhase.duration;
    
    switch (phase) {
      case 'inhale':
        return 0.5 + (progress * 0.5); // от 0.5 до 1
      case 'hold':
        return 1; // остается большим
      case 'exhale':
        return 1 - (progress * 0.5); // от 1 до 0.5
      case 'pause':
        return 0.5; // маленький
      default:
        return 0.5;
    }
  };

  return (
    <div className={cn("psychology-card p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
          <WindIcon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Дыхательное упражнение</h3>
          <p className="text-sm text-muted-foreground">
            Техника 4-7-8 для расслабления
          </p>
        </div>
      </div>

      {/* Визуализация дыхания */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-40 h-40 flex items-center justify-center mb-4">
          {/* Внешний круг */}
          <div className="absolute w-full h-full rounded-full border-2 border-muted opacity-30"></div>
          
          {/* Анимированный круг */}
          <div 
            className={cn(
              "rounded-full border-4 transition-all duration-1000 ease-in-out flex items-center justify-center",
              currentPhase.color.replace('text-', 'border-'),
              isActive && "breathing-animation"
            )}
            style={{
              width: `${getCircleScale() * 160}px`,
              height: `${getCircleScale() * 160}px`,
            }}
          >
            <HeartIcon 
              className={cn(
                "transition-all duration-1000",
                currentPhase.color
              )} 
              size={24 + (getCircleScale() * 16)} 
            />
          </div>
        </div>

        {/* Информация о фазе */}
        <div className="text-center mb-4">
          <div className={cn(
            "text-2xl font-semibold mb-1 transition-colors duration-300",
            currentPhase.color
          )}>
            {currentPhase.text}
          </div>
          <div className="text-3xl font-bold text-foreground">
            {timeLeft}
          </div>
          {cycle > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              Цикл: {cycle}
            </div>
          )}
        </div>

        {/* Инструкции */}
        <div className="text-center text-sm text-muted-foreground mb-6 max-w-sm">
          {phase === 'inhale' && "Медленно вдыхайте через нос"}
          {phase === 'hold' && "Задержите дыхание"}
          {phase === 'exhale' && "Медленно выдыхайте через рот"}
          {phase === 'pause' && "Короткая пауза"}
        </div>
      </div>

      {/* Управление */}
      <div className="flex items-center justify-center gap-3">
        {!isActive ? (
          <Button
            onClick={handleStart}
            className="calming-button"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Начать
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            variant="outline"
            className="rounded-full"
          >
            <PauseIcon className="h-4 w-4 mr-2" />
            Пауза
          </Button>
        )}
        
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-full"
        >
          <RotateCcwIcon className="h-4 w-4 mr-2" />
          Сброс
        </Button>
      </div>

      {cycle >= 3 && (
        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-4 w-4 text-primary" />
            <span className="text-sm text-foreground">
              Отлично! Вы завершили {cycle} циклов. Как вы себя чувствуете?
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingExercise;
