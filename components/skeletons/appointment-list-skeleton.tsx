import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BarberAppointmentCardSkeleton() {
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 mr-3" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 mr-3" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 mr-3" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 mr-3" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Skeleton className="h-9 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentListSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Skeleton className="h-10 w-16 mr-4" />
            <div className="ml-4">
              <Skeleton className="h-7 w-36 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-16" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="sm:col-span-2">
                <Skeleton className="h-10 w-full" />
              </div>

              {/* Filters */}
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="w-full mb-6">
          <div className="grid w-full grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg h-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <BarberAppointmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BarberAppointmentsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <BarberAppointmentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function EmptyAppointmentListSkeleton() {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Skeleton className="w-16 h-16 mx-auto mb-4 rounded" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-36 mx-auto mb-6" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </CardContent>
    </Card>
  );
}