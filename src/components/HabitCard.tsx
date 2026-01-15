import { Check, Flame, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/hooks/useHabits';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        'habit-card flex items-center gap-4',
        habit.completedToday && 'habit-card-completed'
      )}
    >
      <Checkbox
        checked={habit.completedToday}
        onCheckedChange={onToggle}
        className={cn(
          'checkbox-habit',
          habit.completedToday && 'animate-check-bounce'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            'font-medium truncate',
            habit.completedToday && 'line-through text-muted-foreground'
          )}>
            {habit.name}
          </h3>
          {habit.currentStreak > 0 && (
            <span className="streak-badge">
              <Flame className="h-3 w-3" />
              {habit.currentStreak}
            </span>
          )}
        </div>
        {habit.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {habit.description}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/edit/${habit.id}`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
