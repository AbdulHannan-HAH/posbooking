import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  variant?: 'pool' | 'conference' | 'hotel' | 'restaurant' | 'admin';
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

const variantStyles = {
  pool: {
    card: 'border-pool/20 hover:border-pool',
    icon: 'gradient-pool',
    gradient: 'from-blue-500 to-cyan-500',
    text: 'text-pool'
  },
  conference: {
    card: 'border-conference/20 hover:border-conference',
    icon: 'gradient-conference',
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-conference'
  },
  hotel: {
    card: 'border-hotel/20 hover:border-hotel',
    icon: 'gradient-hotel',
    gradient: 'from-orange-500 to-red-500',
    text: 'text-hotel'
  },
  restaurant: {
    card: 'border-orange-200 hover:border-orange-500',
    icon: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-500',
    text: 'text-orange-600'
  },
  admin: {
    card: 'border-primary/20 hover:border-primary',
    icon: 'gradient-admin',
    gradient: 'from-gray-700 to-gray-900',
    text: 'text-primary'
  }
};

export function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
  variant = 'admin',
  stats = []
}: ModuleCardProps) {

  // Get styles for the current variant, fallback to admin if variant not found
  const styles = variantStyles[variant] || variantStyles.admin;

  return (
    <Link to={href} className="block group">
      <Card className={cn(
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        styles.card
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center",
              styles.icon
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className={cn(
              "text-sm font-medium",
              styles.text
            )}>
              {variant.charAt(0).toUpperCase() + variant.slice(1)}
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-1 group-hover:text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>

          {stats.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              {stats.map((stat, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className={cn("font-medium", styles.text)}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}