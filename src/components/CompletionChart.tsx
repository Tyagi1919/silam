import { useMemo, useState } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BarChart3, LineChartIcon, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { HabitWithStats } from '@/hooks/useHabits';

interface CompletionChartProps {
  habits: HabitWithStats[];
}

type FilterType = '7days' | '30days' | 'thisWeek' | 'thisMonth';
type ChartType = 'bar' | 'line' | 'area';

export function CompletionChart({ habits }: CompletionChartProps) {
  const [filter, setFilter] = useState<FilterType>('7days');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const isMobile = useIsMobile();

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

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: -20, bottom: 0 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, habits.length || 1]}
              allowDecimals={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" />
                <stop offset="100%" stopColor="hsl(270 80% 60%)" />
              </linearGradient>
            </defs>
            <Line 
              type="monotone"
              dataKey="completed" 
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ fill: 'hsl(250 80% 60%)', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: 'hsl(250 80% 60%)', strokeWidth: 0, r: 6 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, habits.length || 1]}
              allowDecimals={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(250 80% 60%)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="hsl(270 80% 60%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="areaStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" />
                <stop offset="100%" stopColor="hsl(270 80% 60%)" />
              </linearGradient>
            </defs>
            <Area 
              type="monotone"
              dataKey="completed" 
              stroke="url(#areaStroke)"
              strokeWidth={2}
              fill="url(#areaGradient)"
            />
          </AreaChart>
        );

      default: // bar
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, habits.length || 1]}
              allowDecimals={false}
              className="text-muted-foreground"
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" />
                <stop offset="100%" stopColor="hsl(270 80% 60%)" />
              </linearGradient>
            </defs>
            <Bar 
              dataKey="completed" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill="url(#barGradient)"
                  fillOpacity={entry.percentage >= 100 ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <CardTitle className="text-lg font-medium">Daily Completion Rate</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <ToggleGroup 
            type="single" 
            value={chartType} 
            onValueChange={(value) => value && setChartType(value as ChartType)}
            className="bg-muted rounded-lg p-0.5"
          >
            <ToggleGroupItem value="bar" aria-label="Bar chart" className="h-8 w-8 p-0 data-[state=on]:bg-background">
              <BarChart3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Line chart" className="h-8 w-8 p-0 data-[state=on]:bg-background">
              <LineChartIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="area" aria-label="Area chart" className="h-8 w-8 p-0 data-[state=on]:bg-background">
              <TrendingUp className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="thisWeek">This Week</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          <div className={isMobile ? "h-[200px]" : "h-[250px]"}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
