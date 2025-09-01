/**
 * Standardized status badge component for consistent status displays
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const statusBadgeVariants = cva(
  'font-medium',
  {
    variants: {
      status: {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
        scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
        no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800',
        active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800',
        online: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
        offline: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800',
        warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2'
      }
    },
    defaultVariants: {
      status: 'info',
      size: 'md'
    }
  }
);

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children?: React.ReactNode;
  className?: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed', 
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  active: 'Active',
  inactive: 'Inactive',
  online: 'Online',
  offline: 'Offline',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
  success: 'Success'
};

export function StatusBadge({ status, size, className, children, ...props }: StatusBadgeProps) {
  const statusKey = status || 'info';
  const displayText = children || statusLabels[statusKey] || statusKey;

  return (
    <Badge
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {displayText}
    </Badge>
  );
}

// Specialized status badge components
export function AppointmentStatusBadge({ 
  status, 
  size = 'md', 
  className 
}: { 
  status: 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const statusMap: Record<string, NonNullable<StatusBadgeProps['status']>> = {
    'PENDING': 'pending',
    'CONFIRMED': 'confirmed',
    'SCHEDULED': 'scheduled', 
    'COMPLETED': 'completed',
    'CANCELLED': 'cancelled',
    'NO_SHOW': 'no_show'
  };

  return (
    <StatusBadge 
      status={statusMap[status]} 
      size={size} 
      className={className}
    />
  );
}

export function UserStatusBadge({ 
  status, 
  size = 'md', 
  className 
}: { 
  status: boolean | 'active' | 'inactive'; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const mappedStatus = typeof status === 'boolean' 
    ? (status ? 'active' : 'inactive')
    : status;

  return (
    <StatusBadge 
      status={mappedStatus as NonNullable<StatusBadgeProps['status']>} 
      size={size} 
      className={className}
    />
  );
}

export function OnlineStatusBadge({ 
  isOnline, 
  size = 'sm', 
  className 
}: { 
  isOnline: boolean; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <StatusBadge 
      status={isOnline ? 'online' : 'offline'} 
      size={size} 
      className={className}
    />
  );
}

export function NotificationBadge({ 
  type, 
  size = 'sm', 
  className,
  children 
}: { 
  type: 'success' | 'warning' | 'error' | 'info'; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <StatusBadge 
      status={type} 
      size={size} 
      className={className}
    >
      {children}
    </StatusBadge>
  );
}