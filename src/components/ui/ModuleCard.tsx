import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant: 'pool' | 'conference' | 'hotel';
  stats?: { label: string; value: string | number }[];
}

const variantStyles = {
  pool: {
    gradient: 'gradient-pool',
    light: 'bg-pool-light',
    border: 'border-pool/20',
  },
  conference: {
    gradient: 'gradient-conference',
    light: 'bg-conference-light',
    border: 'border-conference/20',
  },
  hotel: {
    gradient: 'gradient-hotel',
    light: 'bg-hotel-light',
    border: 'border-hotel/20',
  },
};

export function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  variant,
  stats,
}: ModuleCardProps) {
  const styles = variantStyles[variant];

  return (
    <Link to={href} className="block group">
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl bg-card border p-6 transition-all duration-300',
          'hover:shadow-xl hover:-translate-y-1',
          styles.border
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'h-14 w-14 rounded-xl flex items-center justify-center mb-4',
            styles.gradient
          )}
        >
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            {stats.map((stat, index) => (
              <div key={index}>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Arrow indicator */}
        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
