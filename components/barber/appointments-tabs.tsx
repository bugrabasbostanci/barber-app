import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "./appointment-card";
import { AppointmentsEmptyState } from "./appointments-empty-state";

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

interface AppointmentsTabsProps {
  appointments: Appointment[];
  onDeleteAppointment: (id: string) => void;
}

export function AppointmentsTabs({ appointments, onDeleteAppointment }: AppointmentsTabsProps) {
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "CONFIRMED" || apt.status === "SCHEDULED"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "COMPLETED"
  );
  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
  );

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6 h-12 text-sm sm:text-base">
        <TabsTrigger value="upcoming">
          Yaklaşan ({upcomingAppointments.length})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Tamamlanan ({completedAppointments.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          İptal ({cancelledAppointments.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcomingAppointments.length === 0 ? (
          <AppointmentsEmptyState type="upcoming" showCreateButton />
        ) : (
          <div>
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onDelete={onDeleteAppointment}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed">
        {completedAppointments.length === 0 ? (
          <AppointmentsEmptyState type="completed" />
        ) : (
          <div>
            {completedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onDelete={onDeleteAppointment}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="cancelled">
        {cancelledAppointments.length === 0 ? (
          <AppointmentsEmptyState type="cancelled" />
        ) : (
          <div>
            {cancelledAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onDelete={onDeleteAppointment}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}