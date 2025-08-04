import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentCardSkeleton() {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Status badge and shop name */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Appointment details */}
        <div className="space-y-3 mb-4">
          {/* Date */}
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 mr-3" />
            <Skeleton className="h-5 w-32" />
          </div>
          
          {/* Time */}
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 mr-3" />
            <Skeleton className="h-4 w-24" />
          </div>
          
          {/* Staff */}
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 mr-3" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        {/* Action button */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function AppointmentsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <AppointmentCardSkeleton key={i} />
      ))}
    </div>
  );
}