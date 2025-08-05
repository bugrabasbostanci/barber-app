"use client";

import {
  AppointmentList,
  useAppointments,
  useAppointmentActions,
  type Appointment,
} from "@/features/appointments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentsListProps {
  appointments?: Appointment[];
}

export function AppointmentsList({
  appointments: initialAppointments,
}: AppointmentsListProps) {
  // Use the new appointments hook if no initial appointments provided
  const {
    appointments: fetchedAppointments,
    loading,
    error,
    filters,
    updateFilters,
  } = useAppointments();

  const {
    loading: actionLoading,
  } = useAppointmentActions();

  // Use provided appointments or fetched ones
  const appointments = initialAppointments || fetchedAppointments;

  if (loading && !initialAppointments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !initialAppointments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Randevular</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Randevular ({appointments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentList
          appointments={appointments}
          loading={actionLoading}
          filters={filters}
          onFiltersChange={updateFilters}
        />
      </CardContent>
    </Card>
  );
}
