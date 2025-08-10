/**
 * Standardized section header component for consistent page and section titles
 */

'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'centered' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

const sizeVariants = {
  sm: {
    title: 'text-lg font-semibold',
    subtitle: 'text-sm text-muted-foreground',
    description: 'text-sm text-muted-foreground',
    icon: 'w-5 h-5',
    spacing: 'mb-3'
  },
  md: {
    title: 'text-xl font-semibold',
    subtitle: 'text-sm text-muted-foreground',
    description: 'text-sm text-muted-foreground',
    icon: 'w-6 h-6',
    spacing: 'mb-4'
  },
  lg: {
    title: 'text-2xl font-bold',
    subtitle: 'text-base text-muted-foreground',
    description: 'text-sm text-muted-foreground',
    icon: 'w-7 h-7',
    spacing: 'mb-6'
  },
  xl: {
    title: 'text-3xl font-bold',
    subtitle: 'text-lg text-muted-foreground',
    description: 'text-base text-muted-foreground',
    icon: 'w-8 h-8',
    spacing: 'mb-8'
  }
};

export function SectionHeader({
  title,
  subtitle,
  description,
  icon: HeaderIcon,
  actions,
  size = 'md',
  variant = 'default',
  className,
  children
}: SectionHeaderProps) {
  const sizeConfig = sizeVariants[size];

  return (
    <div className={cn(
      sizeConfig.spacing,
      variant === 'centered' && 'text-center',
      className
    )}>
      <div className={cn(
        'flex items-start justify-between gap-4',
        variant === 'centered' && 'flex-col items-center'
      )}>
        <div className={cn(
          'flex-1 min-w-0',
          variant === 'centered' && 'text-center'
        )}>
          <div className="flex items-center gap-3 mb-2">
            {HeaderIcon && (
              <HeaderIcon className={cn(
                sizeConfig.icon,
                'text-muted-foreground flex-shrink-0'
              )} />
            )}
            <h1 className={cn(
              sizeConfig.title,
              'truncate'
            )}>
              {title}
            </h1>
          </div>
          
          {subtitle && (
            <p className={cn(
              sizeConfig.subtitle,
              'mt-1'
            )}>
              {subtitle}
            </p>
          )}
          
          {description && (
            <p className={cn(
              sizeConfig.description,
              'mt-2 max-w-2xl',
              variant === 'centered' && 'mx-auto'
            )}>
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className={cn(
            'flex items-center gap-2 flex-shrink-0',
            variant === 'centered' && 'mt-4'
          )}>
            {actions}
          </div>
        )}
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Specialized header variants
export function PageHeader(props: Omit<SectionHeaderProps, 'size' | 'variant'>) {
  return <SectionHeader {...props} size="xl" variant="default" />;
}

export function SectionTitle(props: Omit<SectionHeaderProps, 'size' | 'variant'>) {
  return <SectionHeader {...props} size="lg" variant="default" />;
}

export function SubsectionHeader(props: Omit<SectionHeaderProps, 'size' | 'variant'>) {
  return <SectionHeader {...props} size="md" variant="default" />;
}

export function CompactHeader(props: Omit<SectionHeaderProps, 'size' | 'variant'>) {
  return <SectionHeader {...props} size="sm" variant="minimal" />;
}

export function CenteredHeader(props: Omit<SectionHeaderProps, 'variant'>) {
  return <SectionHeader {...props} variant="centered" />;
}