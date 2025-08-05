"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Phone, MessageSquare, Edit, X } from "lucide-react";
import { AppointmentCardProps } from '../types/appointment.types';
import { formatTurkishDate } from "@/lib/date-time";
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
    case 'confirmed':
      return 'Onaylandı';
    case 'pending':
      return 'Bekliyor';
    case 'cancelled':
      return 'İptal';
    case 'completed':
      return 'Tamamlandı';
    default:
      return status;
  }
};

export function AppointmentCard({ 
  appointment, 
  onEdit, 
  onCancel, 
  onStatusChange 
}: AppointmentCardProps) {
  const customerName = appointment.customer
    ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
    : appointment.manualCustomerName || 'Unknown Customer';

  const customerPhone = appointment.customer?.phone || appointment.manualCustomerPhone;
  const staffName = `${appointment.staff.firstName} ${appointment.staff.lastName}`;

  const handleStatusChange = (newStatus: typeof appointment.status) => {
    onStatusChange?.(appointment.id, newStatus);
  };

  const canCancel = appointment.status !== 'cancelled' && appointment.status !== 'completed';
  const canEdit = appointment.status !== 'completed';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", getStatusColor(appointment.status))}>
              {getStatusText(appointment.status)}
            </Badge>
            <span className="text-sm text-gray-500">
              {formatTurkishDate(appointment.date)}
            </span>
          </div>
          
          {(onEdit || onCancel) && (
            <div className="flex space-x-1">
              {onEdit && canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(appointment)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onCancel && canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(appointment.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{customerName}</span>
          </div>

          {customerPhone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{customerPhone}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Berber: {staffName}</span>
          </div>

          {appointment.notes && (
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
              <span className="text-sm text-gray-600">{appointment.notes}</span>
            </div>
          )}
        </div>

        {onStatusChange && appointment.status === 'pending' && (
          <div className="flex space-x-2 mt-4 pt-3 border-t">
            <Button
              size="sm"
              onClick={() => handleStatusChange('confirmed')}
              className="bg-green-600 hover:bg-green-700"
            >
              Onayla
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange('cancelled')}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              İptal Et
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}