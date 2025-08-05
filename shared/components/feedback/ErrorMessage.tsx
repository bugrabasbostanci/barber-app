"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Bir hata oluştu',
  message,
  variant = 'destructive',
  showRetry = false,
  onRetry,
  className
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className={cn('', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm">{message}</p>
          </div>
          
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Tekrar Dene
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}