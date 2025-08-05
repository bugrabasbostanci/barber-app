"use client";

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function SuccessMessage({
  title = 'Başarılı!',
  message,
  className
}: SuccessMessageProps) {
  return (
    <Alert className={cn('border-green-200 bg-green-50', className)}>
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div>
          <p className="font-medium text-green-800">{title}</p>
          <p className="text-sm text-green-700">{message}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}