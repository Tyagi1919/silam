import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  frequency: z.enum(['daily', 'weekly']),
  weekly_days: z.array(z.number()).optional(),
  start_date: z.string(),
  reminder_time: z.string().optional(),
  track_count: z.boolean().optional(),
  count_goal: z.number().min(1).optional(),
});

export type HabitFormData = z.infer<typeof habitSchema>;

interface HabitFormProps {
  defaultValues?: Partial<HabitFormData>;
  onSubmit: (data: HabitFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function HabitForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Habit' }: HabitFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: '',
      description: '',
      frequency: 'daily',
      weekly_days: [],
      start_date: format(new Date(), 'yyyy-MM-dd'),
      reminder_time: '',
      track_count: false,
      count_goal: undefined,
      ...defaultValues,
    },
  });

  const frequency = watch('frequency');
  const weeklyDays = watch('weekly_days') || [];
  const trackCount = watch('track_count');

  const toggleDay = (day: number) => {
    const current = weeklyDays;
    if (current.includes(day)) {
      setValue('weekly_days', current.filter(d => d !== day));
    } else {
      setValue('weekly_days', [...current, day]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Morning meditation"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Add a short description..."
          rows={3}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Frequency</Label>
        <Select
          value={frequency}
          onValueChange={(value: 'daily' | 'weekly') => setValue('frequency', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly (select days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {frequency === 'weekly' && (
        <div className="space-y-2">
          <Label>Select Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.value}
                type="button"
                variant={weeklyDays.includes(day.value) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          type="date"
          {...register('start_date')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reminder_time">Daily Reminder (optional)</Label>
        <Input
          id="reminder_time"
          type="time"
          {...register('reminder_time')}
        />
        <p className="text-xs text-muted-foreground">
          Set a time to receive browser notifications
        </p>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="track_count"
            checked={trackCount}
            onCheckedChange={(checked) => {
              setValue('track_count', checked === true);
              if (!checked) {
                setValue('count_goal', undefined);
              }
            }}
          />
          <Label htmlFor="track_count" className="font-normal cursor-pointer">
            Do you want to count it?
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          Enable this to track a count (e.g., glasses of water, pages read)
        </p>
        
        {trackCount && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="count_goal">Set a goal (optional)</Label>
            <Input
              id="count_goal"
              type="number"
              placeholder="e.g., 8 glasses"
              min="1"
              {...register('count_goal', { valueAsNumber: true })}
            />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
