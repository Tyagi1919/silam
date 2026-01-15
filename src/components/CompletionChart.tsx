import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HabitWithStats } from '@/hooks/useHabits';

interface CompletionChartProps {
  habits: HabitWithStats[];
}

type FilterType = '7days' | '30days' | 'thisWeek' | 'thisMonth';

export function CompletionChart({ habits }: CompletionChartProps) {
  const [filter, setFilter] = useState<FilterType>('7days');

  const chartData = useMemo(() => {
    const today = new Date();
    let dateRange: Date[];

    switch (filter) {
      case '7days':
        dateRange = eachDayOfInterval({
          start: subDays(today, 6),
          end: today
        });
        break;
      case '30days':
        dateRange = eachDayOfInterval({
          start: subDays(today, 29),
          end: today
        });
        break;
      case 'thisWeek':
        dateRange = eachDayOfInterval({
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 })
        });
        break;
      case 'thisMonth':
        dateRange = eachDayOfInterval({
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
        break;
    }

    return dateRange.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const completed = habits.filter(habit => 
        habit.completions.some(c => c.completed_date === dateStr)
      ).length;
      
      return {
        date: format(date, filter === '30days' || filter === 'thisMonth' ? 'MMM d' : 'EEE'),
        fullDate: format(date, 'MMM d, yyyy'),
        completed,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      };
    });
  }, [habits, filter]);

  const averageCompletion = useMemo(() => {
    if (chartData.length === 0) return 0;
    const totalPercentage = chartData.reduce((acc, day) => acc + day.percentage, 0);
    return Math.round(totalPercentage / chartData.length);
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm">{data.fullDate}</p>
          <p className="text-sm text-muted-foreground">
            {data.completed} of {data.total} habits ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Daily Completion Rate</CardTitle>
        <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="thisWeek">This Week</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          Average: <span className="font-medium text-foreground">{averageCompletion}%</span>
        </div>
        
        {habits.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Add habits to see your completion chart
          </div>
        ) : (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, habits.length]}
                  allowDecimals={false}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="completed" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      className="fill-primary"
                      fillOpacity={entry.percentage >= 100 ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}