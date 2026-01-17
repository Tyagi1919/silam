import { 
  Flame, 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Calendar, 
  Award,
  Crown,
  Rocket,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { GlobalStats } from '@/hooks/useHabits';
import type { HabitWithStats } from '@/hooks/useHabits';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgesProps {
  habits: HabitWithStats[];
  globalStats: GlobalStats;
}

export function AchievementBadges({ habits, globalStats }: AchievementBadgesProps) {
  const { globalCurrentStreak, globalLongestStreak, totalCompleteDays } = globalStats;
  
  const totalHabits = habits.length;
  const todayAllCompleted = habits.length > 0 && habits.every(h => h.completedToday);

  const achievements: Achievement[] = [
    {
      id: 'first-habit',
      name: 'First Step',
      description: 'Create your first habit',
      icon: Star,
      unlocked: totalHabits >= 1,
    },
    {
      id: 'habit-collector',
      name: 'Habit Collector',
      description: 'Create 5 habits',
      icon: Target,
      unlocked: totalHabits >= 5,
      progress: Math.min(totalHabits, 5),
      maxProgress: 5,
    },
    {
      id: 'perfect-day',
      name: 'Perfect Day',
      description: 'Complete all habits in a day',
      icon: Zap,
      unlocked: todayAllCompleted || totalCompleteDays >= 1,
    },
    {
      id: 'streak-starter',
      name: 'Streak Starter',
      description: 'Achieve a 3-day streak',
      icon: Flame,
      unlocked: globalLongestStreak >= 3,
      progress: Math.min(globalCurrentStreak, 3),
      maxProgress: 3,
    },
    {
      id: 'week-warrior',
      name: 'Week Warrior',
      description: 'Complete a 7-day streak',
      icon: Calendar,
      unlocked: globalLongestStreak >= 7,
      progress: Math.min(globalCurrentStreak, 7),
      maxProgress: 7,
    },
    {
      id: 'fortnight-force',
      name: 'Fortnight Force',
      description: 'Complete a 14-day streak',
      icon: Award,
      unlocked: globalLongestStreak >= 14,
      progress: Math.min(globalCurrentStreak, 14),
      maxProgress: 14,
    },
    {
      id: 'monthly-master',
      name: 'Monthly Master',
      description: 'Complete a 30-day streak',
      icon: Trophy,
      unlocked: globalLongestStreak >= 30,
      progress: Math.min(globalCurrentStreak, 30),
      maxProgress: 30,
    },
    {
      id: 'committed',
      name: 'Committed',
      description: 'Complete 50 perfect days total',
      icon: Heart,
      unlocked: totalCompleteDays >= 50,
      progress: Math.min(totalCompleteDays, 50),
      maxProgress: 50,
    },
    {
      id: 'centurion',
      name: 'Centurion',
      description: 'Complete a 100-day streak',
      icon: Crown,
      unlocked: globalLongestStreak >= 100,
      progress: Math.min(globalCurrentStreak, 100),
      maxProgress: 100,
    },
    {
      id: 'legendary',
      name: 'Legendary',
      description: 'Complete a 365-day streak',
      icon: Rocket,
      unlocked: globalLongestStreak >= 365,
      progress: Math.min(globalCurrentStreak, 365),
      maxProgress: 365,
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center justify-between">
          <span>Achievements</span>
          <span className="text-sm font-normal text-muted-foreground">
            {unlockedCount}/{achievements.length} Unlocked
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {achievements.map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon;
  
  return (
    <div className="group relative flex flex-col items-center">
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
          achievement.unlocked
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-primary/30"
            : "bg-muted text-muted-foreground/50"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[160px] text-center">
          <p className="font-medium text-sm">{achievement.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
          {achievement.progress !== undefined && achievement.maxProgress && !achievement.unlocked && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all"
                  style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {achievement.progress}/{achievement.maxProgress}
              </p>
            </div>
          )}
          {achievement.unlocked && (
            <p className="text-xs text-primary mt-1 font-medium">✓ Unlocked!</p>
          )}
        </div>
      </div>
      
      <p className="text-[10px] text-center mt-1 text-muted-foreground truncate w-full hidden sm:block">
        {achievement.name}
      </p>
    </div>
  );
}