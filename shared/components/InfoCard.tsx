/**
 * Standardized info card component for displaying structured information
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface InfoField {
  label: string;
  value: string | number | React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  copyable?: boolean;
}

export interface InfoCardProps {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  fields: InfoField[];
  actions?: React.ReactNode;
  variant?: 'default' | 'compact' | 'detailed';
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
  loading?: boolean;
}

export function InfoCard({
  title,
  subtitle,
  icon: HeaderIcon,
  fields,
  actions,
  variant = 'default',
  layout = 'vertical',
  className,
  loading = false
}: InfoCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              {subtitle && <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>}
            </div>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: fields.length }).map((_, index) => (
              <div key={index} className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const gridCols = layout === 'grid' 
    ? fields.length <= 2 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
    : '';

  const renderField = (field: InfoField, index: number) => {
    const FieldIcon = field.icon;
    
    return (
      <div 
        key={index} 
        className={cn(
          layout === 'horizontal' && 'flex items-center justify-between',
          layout === 'vertical' && 'space-y-1',
          layout === 'grid' && 'space-y-1',
          field.className
        )}
      >
        <div className={cn(
          'flex items-center gap-2',
          variant === 'compact' ? 'text-sm' : 'text-sm',
          layout === 'horizontal' && 'flex-shrink-0'
        )}>
          {FieldIcon && (
            <FieldIcon className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground font-medium">
            {field.label}
          </span>
        </div>
        <div className={cn(
          variant === 'compact' ? 'text-sm' : 'text-sm',
          layout === 'horizontal' && 'text-right',
          'font-medium'
        )}>
          {typeof field.value === 'string' || typeof field.value === 'number' 
            ? field.value 
            : field.value
          }
        </div>
      </div>
    );
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      {(title || subtitle || HeaderIcon) && (
        <CardHeader className={cn(
          variant === 'compact' && 'pb-3',
          'flex flex-row items-center justify-between'
        )}>
          <div className="flex items-center gap-3">
            {HeaderIcon && (
              <HeaderIcon className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              {title && (
                <CardTitle className={cn(
                  variant === 'compact' ? 'text-base' : 'text-lg'
                )}>
                  {title}
                </CardTitle>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className={cn(
        variant === 'compact' && 'pt-0',
        !title && !subtitle && !HeaderIcon && 'pt-6'
      )}>
        <div className={cn(
          layout === 'vertical' && 'space-y-3',
          layout === 'horizontal' && 'space-y-3',
          layout === 'grid' && `grid ${gridCols} gap-4`
        )}>
          {fields.map(renderField)}
        </div>
        
        {!actions && actions !== null && (
          <div className="flex justify-end pt-4">
            {actions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized info card variants
export function CustomerInfoCard(props: Omit<InfoCardProps, 'variant'>) {
  return <InfoCard {...props} variant="detailed" layout="vertical" />;
}

export function AppointmentInfoCard(props: Omit<InfoCardProps, 'variant'>) {
  return <InfoCard {...props} variant="default" layout="grid" />;
}

export function CompactInfoCard(props: Omit<InfoCardProps, 'variant'>) {
  return <InfoCard {...props} variant="compact" layout="horizontal" />;
}