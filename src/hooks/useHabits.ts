import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInDays, parseISO, subDays, isAfter, isBefore, isEqual } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];
type HabitCompletion = Database['public']['Tables']['habit_completions']['Row'];

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  completions: HabitCompletion[];
  completionRate: number;
}

export function useHabits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const habitsQuery = useQuery({
    queryKey: ['habits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;

      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*');

      if (completionsError) throw completionsError;

      const today = format(new Date(), 'yyyy-MM-dd');

      return habits.map((habit): HabitWithStats => {
        const habitCompletions = completions.filter(c => c.habit_id === habit.id);
        const completedToday = habitCompletions.some(c => c.completed_date === today);
        
        const { currentStreak, longestStreak } = calculateStreaks(habit, habitCompletions);
        const completionRate = calculateCompletionRate(habit, habitCompletions);

        return {
          ...habit,
          currentStreak,
          longestStreak,
          completedToday,
          completions: habitCompletions,
          completionRate
        };
      });
    },
    enabled: !!user,
  });

  const createHabit = useMutation({
    mutationFn: async (habit: Omit<HabitInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, ...updates }: HabitUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      const { data: existing } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('habit_id', habitId)
        .eq('completed_date', date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .insert({ habit_id: habitId, completed_date: date });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return {
    habits: habitsQuery.data ?? [],
    isLoading: habitsQuery.isLoading,
    error: habitsQuery.error,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
  };
}

function calculateStreaks(habit: Habit, completions: HabitCompletion[]) {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = completions
    .map(c => c.completed_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let checkDate = today;
  
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  
  if (sortedDates.includes(todayStr)) {
    currentStreak = 1;
    checkDate = subDays(today, 1);
  } else if (sortedDates.includes(yesterdayStr)) {
    currentStreak = 1;
    checkDate = subDays(today, 2);
  } else {
    return { currentStreak: 0, longestStreak: calculateLongestStreak(sortedDates) };
  }

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    if (sortedDates.includes(dateStr)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(currentStreak, calculateLongestStreak(sortedDates));

  return { currentStreak, longestStreak };
}

function calculateLongestStreak(sortedDates: string[]) {
  if (sortedDates.length === 0) return 0;

  const uniqueDates = [...new Set(sortedDates)].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = parseISO(uniqueDates[i - 1]);
    const curr = parseISO(uniqueDates[i]);
    
    if (differenceInDays(curr, prev) === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function calculateCompletionRate(habit: Habit, completions: HabitCompletion[]) {
  const startDate = parseISO(habit.start_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.max(1, differenceInDays(today, startDate) + 1);
  const completedDays = completions.length;

  return Math.round((completedDays / totalDays) * 100);
}
