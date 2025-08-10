"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, MessageSquare } from "lucide-react";
import { CalendarAppointment } from "../types";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: CalendarAppointment;
  onClick?: (appointment: CalendarAppointment) => void;
  compact?: boolean;
  showDate?: boolean;
  className?: string;
}

const statusConfig = {
  SCHEDULED: {
    label: "Planlandı",
    variant: "secondary" as const,
    color: "bg-blue-100 border-blue-200 text-blue-800",
  },
  CONFIRMED: {
    label: "Onaylandı",
    variant: "default" as const,
    color: "bg-green-100 border-green-200 text-green-800",
  },
  COMPLETED: {
    label: "Tamamlandı",
    variant: "outline" as const,
    color: "bg-gray-100 border-gray-200 text-gray-600",
  },
  CANCELLED: {
    label: "İptal Edildi",
    variant: "destructive" as const,
    color: "bg-red-100 border-red-200 text-red-800",
  },
  NO_SHOW: {
    label: "Gelmedi",
    variant: "destructive" as const,
    color: "bg-orange-100 border-orange-200 text-orange-800",
  },
};

export function AppointmentCard({
  appointment,
  onClick,
  compact = false,
  showDate = false,
  className = "",
}: AppointmentCardProps) {
  const statusInfo = statusConfig[appointment.status];
  const customerName = appointment.customer
    ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
    : appointment.manualCustomerName || "Müşteri bilgisi yok";

  const customerPhone =
    appointment.customer?.phone || appointment.manualCustomerPhone;

  const handleClick = () => {
    onClick?.(appointment);
  };

  if (compact) {
    return (
      <div
        className={cn(
          "p-2 rounded-md border cursor-pointer transition-colors hover:bg-muted/50",
          statusInfo.color,
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs font-medium">{appointment.startTime}</span>
            <span className="text-xs truncate">{customerName}</span>
          </div>
          <Badge variant={statusInfo.variant} className="text-xs px-1 py-0 h-4">
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/50",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {appointment.startTime} - {appointment.endTime}
            </span>
            {showDate && (
              <span className="text-sm text-muted-foreground">
                {new Date(appointment.date).toLocaleDateString("tr-TR")}
              </span>
            )}
          </div>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{customerName}</span>
          </div>

          {customerPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {customerPhone}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Personel: {appointment.staff.firstName}{" "}
              {appointment.staff.lastName}
            </span>
          </div>

          {appointment.notes && (
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm text-muted-foreground">
                {appointment.notes}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
