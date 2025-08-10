/**
 * Standardized stats card component for consistent dashboard statistics
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'red' | 'yellow' | 'gray';
  trend?: {
    value: number;
    label: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'highlighted' | 'minimal';
  className?: string;
  loading?: boolean;
}

const colorVariants = {
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50/50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500'
  },
  green: {
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50/50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500'
  },
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50/50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-500'
  },
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50/50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-500'
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-500'
  },
  red: {
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500'
  },
  yellow: {
    text: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50/50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-500'
  },
  gray: {
    text: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-50/50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-500'
  }
};

const sizeVariants = {
  sm: {
    card: 'p-4',
    value: 'text-2xl',
    title: 'text-sm',
    subtitle: 'text-xs',
    icon: 'w-5 h-5'
  },
  md: {
    card: 'p-6',
    value: 'text-3xl',
    title: 'text-sm',
    subtitle: 'text-sm',
    icon: 'w-6 h-6'
  },
  lg: {
    card: 'p-8',
    value: 'text-4xl',
    title: 'text-base',
    subtitle: 'text-sm',
    icon: 'w-8 h-8'
  }
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  size = 'md',
  variant = 'default',
  className,
  loading = false
}: StatsCardProps) {
  const colorConfig = colorVariants[color];
  const sizeConfig = sizeVariants[size];

  const cardClasses = cn(
    variant === 'highlighted' && [colorConfig.bg, 'border-2', colorConfig.border],
    variant === 'minimal' && 'shadow-none border-0',
    className
  );

  if (loading) {
    return (
      <Card className={cardClasses}>
        <CardContent className={cn('text-center', sizeConfig.card)}>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClasses}>
      <CardContent className={cn('text-center', sizeConfig.card)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <div className={cn('font-bold mb-2', sizeConfig.value, colorConfig.text)}>
              {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
            </div>
          </div>
          {Icon && (
            <Icon className={cn(sizeConfig.icon, colorConfig.icon)} />
          )}
        </div>
        
        <div className={cn('font-medium text-muted-foreground', sizeConfig.title)}>
          {title}
        </div>
        
        {subtitle && (
          <div className={cn('text-muted-foreground mt-1', sizeConfig.subtitle)}>
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className={cn(
              'text-xs font-medium',
              trend.type === 'increase' && 'text-green-600 dark:text-green-400',
              trend.type === 'decrease' && 'text-red-600 dark:text-red-400',
              trend.type === 'neutral' && 'text-gray-600 dark:text-gray-400'
            )}>
              {trend.type === 'increase' && '↗'}
              {trend.type === 'decrease' && '↘'}
              {trend.type === 'neutral' && '→'}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized stat card variants
export function CriticalStatsCard(props: Omit<StatsCardProps, 'variant' | 'size'>) {
  return <StatsCard {...props} variant="highlighted" size="lg" />;
}

export function ImportantStatsCard(props: Omit<StatsCardProps, 'variant' | 'size'>) {
  return <StatsCard {...props} variant="default" size="md" />;
}

export function SecondaryStatsCard(props: Omit<StatsCardProps, 'variant' | 'size'>) {
  return <StatsCard {...props} variant="minimal" size="sm" />;
}