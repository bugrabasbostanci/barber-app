"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";
import { AppointmentCellProps } from '../../types/calendar.types';
import { cn } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed': return 'Onaylandı';
    case 'pending': return 'Bekliyor';
    case 'cancelled': return 'İptal';
    case 'completed': return 'Tamamlandı';
    default: return status;
  }
};

export function AppointmentCell({ appointment, onClick }: AppointmentCellProps) {
  const customerName = appointment.customer
    ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
    : appointment.manualCustomerName || 'Bilinmeyen';

  const customerPhone = appointment.customer?.phone || appointment.manualCustomerPhone;

  const handleClick = () => {
    onClick?.(appointment);
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full h-auto p-3 justify-start text-left hover:shadow-md transition-all",
        "border-l-4",
        appointment.status === 'confirmed' && "border-l-green-500 hover:bg-green-50",
        appointment.status === 'pending' && "border-l-yellow-500 hover:bg-yellow-50",
        appointment.status === 'cancelled' && "border-l-red-500 hover:bg-red-50",
        appointment.status === 'completed' && "border-l-blue-500 hover:bg-blue-50"
      )}
      onClick={handleClick}
    >
      <div className="w-full space-y-2">
        {/* Time and Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">
            {appointment.startTime} - {appointment.endTime}
          </span>
          <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
            {getStatusText(appointment.status)}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="space-y-1">
          <div className="font-medium text-sm">{customerName}</div>
          
          {customerPhone && (
            <div className="flex items-center text-xs text-gray-600">
              <Phone className="w-3 h-3 mr-1" />
              {customerPhone}
            </div>
          )}
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="flex items-start text-xs text-gray-600">
            <MessageSquare className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
            <span className="truncate">{appointment.notes}</span>
          </div>
        )}

        {/* Staff Info */}
        <div className="text-xs text-gray-500">
          Berber: {appointment.staff.firstName} {appointment.staff.lastName}
        </div>
      </div>
    </Button>
  );
}