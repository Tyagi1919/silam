import { format } from 'date-fns';
import { Plus, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { HabitTableTracker } from '@/components/HabitTableTracker';
import { CompletionChart } from '@/components/CompletionChart';
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
import { useState } from 'react';

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

  const isCompletedOnDate = (habit: typeof habits[0], date: string) => {
    return habit.completions.some(c => c.completed_date === date);
  };

  const getCompletionCount = (habit: typeof habits[0], date: string) => {
    const completion = habit.completions.find(c => c.completed_date === date);
    return completion?.count ?? null;
  };

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Habit Tracker</h1>
            <p className="text-muted-foreground">
              {format(today, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Link to="/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Habit
            </Button>
          </Link>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
              <Target className="h-4 w-4 text-primary" />
              <span>
                {completedCount} of {totalCount} completed today
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
            <div className="h-[300px] rounded-lg bg-muted animate-pulse" />
          </div>
        ) : (
          <>
            <HabitTableTracker
              habits={habits}
              onToggle={handleToggle}
              onDelete={(id) => setDeletingId(id)}
              isCompletedOnDate={isCompletedOnDate}
              getCompletionCount={getCompletionCount}
            />

            <CompletionChart habits={habits} />
          </>
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