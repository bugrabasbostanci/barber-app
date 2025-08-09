import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, User, Phone, Trash2 } from "lucide-react";
import { formatTurkishDateShort } from "@/lib/date-time";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  } | null;
  staff: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "SCHEDULED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "CANCELLED":
    case "NO_SHOW":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "Onaylandı";
    case "SCHEDULED":
      return "Planlandı";
    case "COMPLETED":
      return "Tamamlandı";
    case "CANCELLED":
      return "İptal";
    case "NO_SHOW":
      return "Gelmedi";
    default:
      return status;
  }
};

const getStaffColor = () => {
  return "text-blue-600";
};

const formatDate = (dateString: string) => {
  return formatTurkishDateShort(dateString);
};

export function AppointmentCard({ appointment, onDelete }: AppointmentCardProps) {
  const customerName = appointment.customer
    ? `${appointment.customer.firstName || ""} ${
        appointment.customer.lastName || ""
      }`.trim()
    : appointment.manualCustomerName || "Bilinmeyen Müşteri";

  const customerPhone =
    appointment.customer?.phone || appointment.manualCustomerPhone || "";
  const staffName = `${appointment.staff.firstName || ""} ${
    appointment.staff.lastName || ""
  }`.trim();

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(appointment.status)}>
              {getStatusText(appointment.status)}
            </Badge>
            <span className={`font-semibold text-lg ${getStaffColor()}`}>
              {staffName}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              <span className="font-semibold text-lg">{customerName}</span>
            </div>
            {customerPhone && (
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground">{customerPhone}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
              <span className="font-medium">
                {formatDate(appointment.date)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
              <span>
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                Not: {appointment.notes}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => onDelete(appointment.id)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}