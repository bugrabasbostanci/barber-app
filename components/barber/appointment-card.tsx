import { Calendar, Clock, User, Phone, Trash2, UserCheck } from "lucide-react";
import { formatTurkishDateShort } from "@/lib/date-time";
import { 
  InfoCard, 
  AppointmentStatusBadge,
  InfoField 
} from "@/shared/components";

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

  const fields: InfoField[] = [
    {
      label: 'Müşteri',
      value: customerName,
      icon: User
    },
    ...(customerPhone ? [{
      label: 'Telefon',
      value: customerPhone,
      icon: Phone
    }] : []),
    {
      label: 'Berber',
      value: staffName,
      icon: UserCheck,
      className: 'text-blue-600 font-semibold'
    },
    {
      label: 'Tarih',
      value: formatTurkishDateShort(appointment.date),
      icon: Calendar
    },
    {
      label: 'Saat',
      value: `${appointment.startTime} - ${appointment.endTime}`,
      icon: Clock
    },
    ...(appointment.notes ? [{
      label: 'Not',
      value: appointment.notes
    }] : [])
  ];

  return (
    <InfoCard
      fields={fields}
      actions={
        <div className="flex items-center gap-3">
          <AppointmentStatusBadge 
            status={appointment.status as 'PENDING' | 'CONFIRMED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'}
            size="sm"
          />
          <button
            onClick={() => onDelete(appointment.id)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-transparent border border-red-200 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Sil
          </button>
        </div>
      }
      variant="default"
      layout="grid"
      className="mb-4 hover:shadow-md transition-shadow"
    />
  );
}