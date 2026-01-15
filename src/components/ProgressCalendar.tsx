import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isFuture, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProgressCalendarProps {
  completedDates: string[];
  startDate: string;
}

export function ProgressCalendar({ completedDates, startDate }: ProgressCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const habitStartDate = parseISO(startDate);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getFirstDayOffset = () => {
    return monthStart.getDay();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: getFirstDayOffset() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isCompleted = completedDates.includes(dateStr);
          const isBeforeStart = day < habitStartDate;
          const isFutureDay = isFuture(day);

          return (
            <div
              key={dateStr}
              className={cn(
                'calendar-day',
                isCompleted && 'calendar-day-completed',
                !isCompleted && !isFutureDay && !isBeforeStart && 'calendar-day-missed',
                (isFutureDay || isBeforeStart) && 'calendar-day-future',
                isToday(day) && !isCompleted && 'ring-2 ring-primary ring-offset-1'
              )}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-destructive/20" />
          <span>Missed</span>
        </div>
      </div>
    </div>
  );
}
