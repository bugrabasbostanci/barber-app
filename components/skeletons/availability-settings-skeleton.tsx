import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AvailabilitySettingsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-10 w-16 mr-4" />
            <div className="ml-6">
              <Skeleton className="h-7 w-36 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {/* Working Hours Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Days of Week */}
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-9 w-20" />
                  <span className="text-muted-foreground">-</span>
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Break Time Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-24" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Time Slots */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <Skeleton className="h-10 w-28" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Special Days/Holidays */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              <Skeleton className="h-6 w-28" />
            </CardTitle>
            <Skeleton className="h-10 w-28" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

export function WorkingHoursSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-9 w-16" />
              <span className="text-muted-foreground">-</span>
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BlockedTimeSlotSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-12 rounded-full" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export function BlockedTimeSlotsListSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <Skeleton className="h-6 w-36" />
        </CardTitle>
        <Skeleton className="h-10 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <BlockedTimeSlotSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}