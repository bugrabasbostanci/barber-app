"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dateToLocalString } from "@/lib/date-time";
import { toast } from "sonner";
import { AppointmentListSkeleton } from "@/components/skeletons/appointment-list-skeleton";
import { AppointmentsHeader } from "@/components/barber/appointments-header";
import { AppointmentsFilters } from "@/components/barber/appointments-filters";
import { AppointmentsStats } from "@/components/barber/appointments-stats";
import { AppointmentsTabs } from "@/components/barber/appointments-tabs";
import { DeleteAppointmentDialog } from "@/components/barber/delete-appointment-dialog";

interface Appointment {
  id: string;
  date: string; // API returns string format
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
  createdAt: string; // API returns string format
}

export default function BarberAppointments() {
  const router = useRouter();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-role");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await response.json();
        if (!data.success || (data.data.role !== "BARBER" && data.data.role !== "ADMIN")) {
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(
    null
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await fetch("/api/barber/appointments");
        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          if (
            appointmentsResult.success &&
            Array.isArray(appointmentsResult.data)
          ) {
            setAppointments(appointmentsResult.data);
          }
        }

        // Fetch staff
        const staffResponse = await fetch("/api/staff");
        if (staffResponse.ok) {
          const staffResult = await staffResponse.json();
          if (staffResult.success && Array.isArray(staffResult.data)) {
            setStaffMembers(staffResult.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const customerName = appointment.customer
      ? `${appointment.customer.firstName || ""} ${
          appointment.customer.lastName || ""
        }`.trim()
      : appointment.manualCustomerName || "";

    const customerPhone =
      appointment.customer?.phone || appointment.manualCustomerPhone || "";

    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerPhone.includes(searchTerm);

    const staffName = `${appointment.staff.firstName || ""} ${
      appointment.staff.lastName || ""
    }`.trim();
    const matchesStaff = selectedStaff === "all" || staffName === selectedStaff;

    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;

    const matchesDate =
      !selectedDate || appointment.date === dateToLocalString(selectedDate);

    return matchesSearch && matchesStaff && matchesStatus && matchesDate;
  });


  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    
    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentToDelete));
        setShowDeleteDialog(false);
        setAppointmentToDelete(null);
        toast.success("Randevu başarıyla silindi!");
      } else {
        toast.error("Randevu silinirken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast.error("Randevu silinirken bir hata oluştu.");
    }
  };

  const handleDeleteClick = (id: string) => {
    setAppointmentToDelete(id);
    setShowDeleteDialog(true);
  };


  if (loading) {
    return <AppointmentListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppointmentsHeader />

      <div className="p-4 sm:p-6">
        <AppointmentsFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          selectedStaff={selectedStaff}
          onSelectedStaffChange={setSelectedStaff}
          selectedStatus={selectedStatus}
          onSelectedStatusChange={setSelectedStatus}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          staffMembers={staffMembers}
        />

        <AppointmentsStats appointments={filteredAppointments} />

        <AppointmentsTabs
          appointments={filteredAppointments}
          onDeleteAppointment={handleDeleteClick}
        />
      </div>

      <DeleteAppointmentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteAppointment}
      />
    </div>
  );
}
