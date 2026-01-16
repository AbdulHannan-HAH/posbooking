import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl p-6 border shadow-sm card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p
              className={cn(
                'text-sm',
                changeType === 'positive' && 'text-success',
                changeType === 'negative' && 'text-destructive',
                changeType === 'neutral' && 'text-muted-foreground'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            'h-12 w-12 rounded-xl flex items-center justify-center',
            iconClassName || 'bg-primary/10'
          )}
        >
          <Icon className={cn('h-6 w-6', iconClassName ? 'text-primary-foreground' : 'text-primary')} />
        </div>
      </div>
    </div>
  );
}
