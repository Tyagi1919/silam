import { format } from 'date-fns';
import { Target, Sparkles } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { HabitTableTracker } from '@/components/HabitTableTracker';
import { useHabits } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useMemo } from 'react';

const MOTIVATIONAL_QUOTES = [
  "Small daily improvements lead to stunning results.",
  "Consistency is more important than perfection.",
  "Every day is a chance to build a better you.",
  "Your habits shape your future.",
  "Progress, not perfection.",
  "The secret of your future is hidden in your daily routine.",
  "What you do every day matters more than what you do once in a while.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Habits are the compound interest of self-improvement.",
  "You don't have to be great to start, but you have to start to be great.",
  "The only bad workout is the one that didn't happen.",
  "Discipline is the bridge between goals and accomplishment.",
  "Your future is created by what you do today, not tomorrow.",
  "Excellence is not an act but a habit.",
  "Start where you are. Use what you have. Do what you can.",
  "The journey of a thousand miles begins with a single step.",
  "Make each day your masterpiece.",
  "Be stronger than your excuses.",
  "Believe you can and you're halfway there.",
  "Action is the foundational key to all success.",
  "It's not about having time, it's about making time.",
  "Dream big. Start small. Act now.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Don't count the days, make the days count.",
  "Push yourself because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Motivation gets you started. Habit keeps you going.",
  "You are what you repeatedly do.",
  "Little by little, a little becomes a lot.",
  "Stay focused and never give up."
];

export default function Dashboard() {
  const { habits, isLoading, toggleCompletion, deleteHabit } = useHabits();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const habitToDelete = habits.find(h => h.id === deletingId);

  const today = new Date();

  const handleToggle = async (habitId: string, date: string, count?: number) => {
    try {
      await toggleCompletion.mutateAsync({ habitId, date, count });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update habit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (habitId: string) => {
    try {
      await deleteHabit.mutateAsync(habitId);
      toast({
        title: 'Habit deleted',
        description: 'The habit and all its history have been removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete habit. Please try again.',
        variant: 'destructive',
      });
    }
    setDeletingId(null);
  };

  const todayStr = format(today, 'yyyy-MM-dd');

  // Get a consistent quote based on the day of the year
  const dailyQuote = useMemo(() => {
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, [today]);

  const isCompletedOnDate = (habit: typeof habits[0], date: string) => {
    return habit.completions.some(c => c.completed_date === date);
  };

  const getCompletionCount = (habit: typeof habits[0], date: string) => {
    const completion = habit.completions.find(c => c.completed_date === date);
    return completion?.count ?? null;
  };

  // Use real-time check against completions rather than cached completedToday
  const completedCount = habits.filter(h => isCompletedOnDate(h, todayStr)).length;
  const totalCount = habits.length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Motivational Quote */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-primary/20 p-4">
          <Sparkles className="absolute top-2 right-2 h-5 w-5 text-primary/40" />
          <p className="text-sm sm:text-base font-medium text-foreground/90 italic pr-6">
            "{dailyQuote}"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-muted-foreground">
            {format(today, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          </div>
        ) : (
          <HabitTableTracker
            habits={habits}
            onToggle={handleToggle}
            onDelete={(id) => setDeletingId(id)}
            isCompletedOnDate={isCompletedOnDate}
            getCompletionCount={getCompletionCount}
          />
        )}

        <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{habitToDelete?.name}" and all its tracking history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingId && handleDelete(deletingId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}