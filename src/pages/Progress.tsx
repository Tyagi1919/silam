import { Flame, Target, Trophy, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/StatCard';
import { ProgressCalendar } from '@/components/ProgressCalendar';
import { CompletionChart } from '@/components/CompletionChart';
import { AchievementBadges } from '@/components/AchievementBadges';
import { useHabits } from '@/hooks/useHabits';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function Progress() {
  const { habits, globalStats, isLoading } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const selectedHabit = selectedHabitId === 'all'
    ? null
    : habits.find(h => h.id === selectedHabitId);

  // Calculate aggregate stats
  const totalHabits = habits.length;
  const avgCompletion = totalHabits > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.completionRate, 0) / totalHabits)
    : 0;

  // Get calendar data
  const calendarHabit = selectedHabit || (habits.length > 0 ? habits[0] : null);
  const completedDates = calendarHabit
    ? calendarHabit.completions.map(c => c.completed_date)
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground">Track your habit streaks and completion rates</p>
        </div>

        {totalHabits === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">No progress yet</h2>
            <p className="text-muted-foreground">
              Create some habits to start tracking your progress
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={Target}
                label="Total Habits"
                value={totalHabits}
              />
              <StatCard
                icon={Flame}
                label="Active Streak"
                value={`${globalStats.globalCurrentStreak} days`}
                variant="streak"
              />
              <StatCard
                icon={Trophy}
                label="Best Streak"
                value={`${globalStats.globalLongestStreak} days`}
                variant="success"
              />
              <StatCard
                icon={TrendingUp}
                label="Avg Completion"
                value={`${avgCompletion}%`}
              />
            </div>

            {/* Achievement Badges */}
            <AchievementBadges habits={habits} globalStats={globalStats} />

            {/* Chart - moved to top on mobile */}
            {isMobile && <CompletionChart habits={habits} />}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Calendar View</CardTitle>
                <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select habit" />
                  </SelectTrigger>
                  <SelectContent>
                    {habits.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {calendarHabit ? (
                  <ProgressCalendar
                    completedDates={completedDates}
                    startDate={calendarHabit.start_date}
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Select a habit to view its calendar
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Chart - on desktop, show after calendar */}
            {!isMobile && <CompletionChart habits={habits} />}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Habit Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {habits.map((habit) => (
                  <Card key={habit.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{habit.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-streak">{habit.currentStreak}</p>
                          <p className="text-xs text-muted-foreground">Current Streak</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{habit.longestStreak}</p>
                          <p className="text-xs text-muted-foreground">Best Streak</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{habit.completionRate}%</p>
                          <p className="text-xs text-muted-foreground">Completion</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
