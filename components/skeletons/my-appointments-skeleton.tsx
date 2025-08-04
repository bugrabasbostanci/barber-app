import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentCardSkeleton } from "./appointment-card-skeleton";

export function MyAppointmentsSkeleton() {
  return (
    <div className="px-4 py-6">
      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-2xl">
          <Skeleton className="h-8 w-8 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
        <div className="text-center p-6 bg-green-50 rounded-2xl">
          <Skeleton className="h-8 w-8 mx-auto mb-2" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="grid w-full grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <AppointmentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function AppointmentsPageSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <MyAppointmentsSkeleton />
    </div>
  );
}
