"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppointmentStatus } from '../types/appointment.types';

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const statusConfig = {
  confirmed: {
    label: 'Onaylandı',
    className: 'bg-green-100 text-green-800 border-green-300'
  },
  pending: {
    label: 'Bekliyor',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  cancelled: {
    label: 'İptal',
    className: 'bg-red-100 text-red-800 border-red-300'
  },
  completed: {
    label: 'Tamamlandı',
    className: 'bg-blue-100 text-blue-800 border-blue-300'
  }
};

export function AppointmentStatusBadge({ status, className }: AppointmentStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}