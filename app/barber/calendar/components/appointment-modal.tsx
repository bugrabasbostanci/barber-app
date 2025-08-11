import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTurkishDate } from "@/lib/utils";

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

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function AppointmentModal({ isOpen, onClose, appointment }: AppointmentModalProps) {
  const getCustomerName = (appointment: Appointment) => {
    if (appointment.customer) {
      return `${appointment.customer.firstName || ""} ${
        appointment.customer.lastName || ""
      }`.trim();
    }
    return appointment.manualCustomerName || "Bilinmeyen Müşteri";
  };

  const getCustomerPhone = (appointment: Appointment) => {
    return appointment.customer?.phone || appointment.manualCustomerPhone || "";
  };

  const formatAppointmentTime = (appointment: Appointment) => {
    return `${appointment.startTime} - ${appointment.endTime}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Onaylanmış";
      case "CANCELLED":
        return "İptal Edilmiş";
      case "COMPLETED":
        return "Tamamlanmış";
      default:
        return "Beklemede";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Randevu Detayları</DialogTitle>
        </DialogHeader>

        {appointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Tarih
                </h4>
                <p className="font-semibold">
                  {formatTurkishDate(appointment.date)}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Saat
                </h4>
                <p className="font-semibold">
                  {formatAppointmentTime(appointment)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Müşteri
              </h4>
              <p className="font-semibold text-lg">
                {getCustomerName(appointment)}
              </p>
            </div>

            {getCustomerPhone(appointment) && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Telefon
                </h4>
                <p className="font-semibold">
                  {getCustomerPhone(appointment)}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Berber
              </h4>
              <p className="font-semibold">
                {appointment.staff.firstName} {appointment.staff.lastName}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Durum
              </h4>
              <p className="font-semibold">
                {getStatusText(appointment.status)}
              </p>
            </div>

            {appointment.notes && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Notlar
                </h4>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {appointment.notes}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground">
                Oluşturulma Tarihi
              </h4>
              <p className="text-sm">
                {new Date(appointment.createdAt).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}