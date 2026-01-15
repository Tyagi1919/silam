import { format } from 'date-fns';
import { Plus, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { HabitCard } from '@/components/HabitCard';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export default function Dashboard() {
  const { habits, isLoading, toggleCompletion, deleteHabit } = useHabits();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const handleToggle = async (habitId: string) => {
    try {
      await toggleCompletion.mutateAsync({ habitId, date: todayStr });
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

  const completedCount = habits.filter(h => h.completedToday).length;
  const totalCount = habits.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Today's Habits</h1>
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
                {completedCount} of {totalCount} completed
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="habit-card animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-6 w-6 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">No habits yet</h2>
            <p className="text-muted-foreground mb-4">
              Start building better habits today
            </p>
            <Link to="/create">
              <Button>Create your first habit</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <AlertDialog key={habit.id} open={deletingId === habit.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                <HabitCard
                  habit={habit}
                  onToggle={() => handleToggle(habit.id)}
                  onDelete={() => setDeletingId(habit.id)}
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{habit.name}" and all its tracking history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(habit.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
