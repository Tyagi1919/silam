import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  variant?: 'default' | 'streak' | 'success';
}

export function StatCard({ icon: Icon, label, value, description, variant = 'default' }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'p-2 rounded-lg',
            variant === 'streak' && 'bg-streak/15 text-streak',
            variant === 'success' && 'bg-success/15 text-success',
            variant === 'default' && 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
