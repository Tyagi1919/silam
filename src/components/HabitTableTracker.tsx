import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Flame, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { HabitWithStats } from '@/hooks/useHabits';
import { useNavigate } from 'react-router-dom';

interface HabitTableTrackerProps {
  habits: HabitWithStats[];
  onToggle: (habitId: string, date: string, count?: number) => void;
  onDelete: (habitId: string) => void;
  isCompletedOnDate: (habit: HabitWithStats, date: string) => boolean;
  getCompletionCount: (habit: HabitWithStats, date: string) => number | null;
}

export function HabitTableTracker({ 
  habits, 
  onToggle, 
  onDelete, 
  isCompletedOnDate,
  getCompletionCount 
}: HabitTableTrackerProps) {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [countDialog, setCountDialog] = useState<{
    open: boolean;
    habitId: string;
    habitName: string;
    date: string;
    goal: number | null;
    currentCount: number | null;
  } | null>(null);
  const [countValue, setCountValue] = useState('');

  const today = new Date();
  const baseDate = addDays(today, weekOffset * 7);
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Sort habits by reminder_time (null times at bottom)
  const sortedHabits = [...habits].sort((a, b) => {
    if (!a.reminder_time && !b.reminder_time) return 0;
    if (!a.reminder_time) return 1;
    if (!b.reminder_time) return -1;
    return a.reminder_time.localeCompare(b.reminder_time);
  });

  const handleCellClick = (habit: HabitWithStats, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = isCompletedOnDate(habit, dateStr);
    
    // If habit tracks count and it's not completed yet, show count dialog
    if (habit.track_count && !isCompleted) {
      setCountDialog({
        open: true,
        habitId: habit.id,
        habitName: habit.name,
        date: dateStr,
        goal: habit.count_goal,
        currentCount: null
      });
      setCountValue('');
    } else {
      // Just toggle
      onToggle(habit.id, dateStr);
    }
  };

  const handleCountSubmit = () => {
    if (countDialog) {
      const count = countValue ? parseInt(countValue, 10) : undefined;
      onToggle(countDialog.habitId, countDialog.date, count);
      setCountDialog(null);
      setCountValue('');
    }
  };

  const handleSkipCount = () => {
    if (countDialog) {
      onToggle(countDialog.habitId, countDialog.date);
      setCountDialog(null);
      setCountValue('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(weekOffset - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-medium text-sm border-b border-border min-w-[200px]">
                Habit
              </th>
              {daysOfWeek.map((day) => (
                <th
                  key={day.toISOString()}
                  className={cn(
                    "text-center p-2 font-medium text-xs border-b border-border min-w-[60px]",
                    isToday(day) && "bg-primary/10"
                  )}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div className={cn(
                    "text-lg",
                    isToday(day) && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                </th>
              ))}
              <th className="p-2 border-b border-border w-10"></th>
            </tr>
          </thead>
          <tbody>
            {sortedHabits.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-8 text-muted-foreground">
                  No habits yet. Create your first habit to get started!
                </td>
              </tr>
            ) : (
              sortedHabits.map((habit) => (
                <tr key={habit.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{habit.name}</span>
                          {habit.currentStreak > 0 && (
                            <span className="streak-badge">
                              <Flame className="h-3 w-3" />
                              {habit.currentStreak}
                            </span>
                          )}
                        </div>
                        {habit.reminder_time && (
                          <span className="text-xs text-muted-foreground">
                            {habit.reminder_time.slice(0, 5)}
                          </span>
                        )}
                        {habit.track_count && habit.count_goal && (
                          <span className="text-xs text-primary ml-2">
                            Goal: {habit.count_goal}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  {daysOfWeek.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isCompleted = isCompletedOnDate(habit, dateStr);
                    const count = getCompletionCount(habit, dateStr);
                    const isFuture = day > today;
                    
                    return (
                      <td
                        key={day.toISOString()}
                        className={cn(
                          "text-center p-2 border-b border-border",
                          isToday(day) && "bg-primary/5"
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => handleCellClick(habit, day)}
                            disabled={isFuture}
                            className={cn(
                              "checkbox-habit",
                              isCompleted && "animate-check-bounce",
                              isFuture && "opacity-30"
                            )}
                          />
                          {habit.track_count && count !== null && (
                            <span className="text-xs text-primary font-medium">
                              {count}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-2 border-b border-border">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/edit/${habit.id}`)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count Dialog */}
      <Dialog open={countDialog?.open ?? false} onOpenChange={(open) => !open && setCountDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track Count - {countDialog?.habitName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="count">Enter count for {countDialog?.date}</Label>
              <Input
                id="count"
                type="number"
                placeholder={countDialog?.goal ? `Goal: ${countDialog.goal}` : 'Enter count'}
                value={countValue}
                onChange={(e) => setCountValue(e.target.value)}
                min="0"
              />
              {countDialog?.goal && (
                <p className="text-xs text-muted-foreground">
                  Your goal is {countDialog.goal}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleSkipCount}>
              Skip Count
            </Button>
            <Button onClick={handleCountSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}