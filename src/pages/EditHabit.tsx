import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { HabitForm, HabitFormData } from '@/components/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';

export default function EditHabit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { habits, updateHabit, isLoading } = useHabits();
  const { toast } = useToast();

  const habit = habits.find(h => h.id === id);

  const handleSubmit = async (data: HabitFormData) => {
    if (!id) return;
    
    try {
      await updateHabit.mutateAsync({
        id,
        name: data.name,
        description: data.description || null,
        frequency: data.frequency,
        weekly_days: data.frequency === 'weekly' ? data.weekly_days : null,
        start_date: data.start_date,
        reminder_time: data.reminder_time || null,
        track_count: data.track_count || false,
        count_goal: data.track_count ? data.count_goal : null,
      });
      toast({
        title: 'Habit updated!',
        description: 'Your changes have been saved.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update habit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!habit) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-12">
          <h2 className="text-lg font-medium mb-2">Habit not found</h2>
          <p className="text-muted-foreground mb-4">
            This habit may have been deleted.
          </p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Habit</CardTitle>
          </CardHeader>
          <CardContent>
            <HabitForm
              defaultValues={{
                name: habit.name,
                description: habit.description || '',
                frequency: habit.frequency,
                weekly_days: habit.weekly_days || [],
                start_date: habit.start_date,
                reminder_time: habit.reminder_time || '',
                track_count: habit.track_count || false,
                count_goal: habit.count_goal || undefined,
              }}
              onSubmit={handleSubmit}
              isLoading={updateHabit.isPending}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
