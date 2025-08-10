/**
 * Standardized action card component for consistent interactive cards
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
}

export interface ActionCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  image?: string;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal';
  orientation?: 'vertical' | 'horizontal';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ActionCard({
  title,
  subtitle,
  description,
  icon: HeaderIcon,
  image,
  primaryAction,
  secondaryActions = [],
  variant = 'default',
  orientation = 'vertical',
  className,
  children,
  onClick,
  disabled = false,
  loading = false
}: ActionCardProps) {
  const cardClasses = cn(
    'transition-all duration-200',
    variant === 'elevated' && 'shadow-lg hover:shadow-xl',
    variant === 'outlined' && 'border-2',
    variant === 'minimal' && 'shadow-none border-0',
    onClick && !disabled && 'cursor-pointer hover:shadow-md',
    disabled && 'opacity-60 cursor-not-allowed',
    className
  );

  const renderActions = () => {
    if (!primaryAction && secondaryActions.length === 0) return null;

    return (
      <div className={cn(
        'flex gap-2 pt-4',
        orientation === 'horizontal' ? 'justify-end' : 'justify-start',
        secondaryActions.length > 2 && 'flex-wrap'
      )}>
        {secondaryActions.map((action, index) => {
          const ActionIcon = action.icon;
          return (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'sm'}
              onClick={action.onClick}
              disabled={action.disabled || disabled || loading}
              className="min-w-fit"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
              {action.loading ? 'Yükleniyor...' : action.label}
            </Button>
          );
        })}
        
        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            size={primaryAction.size || 'sm'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || disabled || loading}
            className="min-w-fit"
          >
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
            {primaryAction.loading || loading ? 'Yükleniyor...' : primaryAction.label}
          </Button>
        )}
      </div>
    );
  };

  const renderContent = () => (
    <div className={cn(
      orientation === 'horizontal' && 'flex items-center gap-4',
      orientation === 'vertical' && 'space-y-2'
    )}>
      {image && (
        <div className={cn(
          orientation === 'horizontal' ? 'flex-shrink-0 w-16 h-16' : 'w-full h-32',
          'bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden'
        )}>
          <img 
            src={image} 
            alt={title || ''}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {HeaderIcon && !image && (
        <div className={cn(
          orientation === 'horizontal' ? 'flex-shrink-0' : 'mb-2',
          'flex items-center'
        )}>
          <HeaderIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {title && (
          <CardTitle className={cn(
            orientation === 'horizontal' ? 'text-base' : 'text-lg',
            'truncate'
          )}>
            {title}
          </CardTitle>
        )}
        
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {subtitle}
          </p>
        )}
        
        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}
        
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
        
        {orientation === 'horizontal' && renderActions()}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className={cardClasses}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cardClasses}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      {(title || subtitle || HeaderIcon || image) && !onClick && (
        <CardHeader className="pb-3">
          {renderContent()}
        </CardHeader>
      )}
      
      <CardContent className={cn(
        onClick && (title || subtitle || HeaderIcon || image) ? 'pt-6' : 'pt-0',
        !title && !subtitle && !HeaderIcon && !image && 'pt-6'
      )}>
        {onClick ? renderContent() : children}
        
        {orientation === 'vertical' && renderActions()}
      </CardContent>
    </Card>
  );
}

// Specialized action card variants
export function QuickActionCard(props: Omit<ActionCardProps, 'variant' | 'orientation'>) {
  return <ActionCard {...props} variant="elevated" orientation="horizontal" />;
}

export function FeatureCard(props: Omit<ActionCardProps, 'variant' | 'orientation'>) {
  return <ActionCard {...props} variant="outlined" orientation="vertical" />;
}

export function CompactActionCard(props: Omit<ActionCardProps, 'variant' | 'orientation'>) {
  return <ActionCard {...props} variant="minimal" orientation="horizontal" />;
}