import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { HabitForm, HabitFormData } from '@/components/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { useToast } from '@/hooks/use-toast';

export default function CreateHabit() {
  const navigate = useNavigate();
  const { createHabit } = useHabits();
  const { toast } = useToast();

  const handleSubmit = async (data: HabitFormData) => {
    try {
      await createHabit.mutateAsync({
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
        title: 'Habit created!',
        description: 'Start tracking your new habit today.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create habit. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
            <CardTitle>Create New Habit</CardTitle>
          </CardHeader>
          <CardContent>
            <HabitForm
              onSubmit={handleSubmit}
              isLoading={createHabit.isPending}
              submitLabel="Create Habit"
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
