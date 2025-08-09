// Re-export all barber stores from a single entry point
export { 
  useBarberAppointmentsStore, 
  type BarberAppointment, 
  type DashboardFilters 
} from "./appointments-store";

export { 
  useBarberAvailabilityStore, 
  type AvailabilitySlot, 
  type WeeklySchedule 
} from "./availability-store";

export { 
  useBarberUIStore, 
  type AppointmentEdit 
} from "./ui-store";