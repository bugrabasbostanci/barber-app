import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AppointmentCalendarSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-10 w-16 mr-4" />
            <div className="ml-6">
              <Skeleton className="h-7 w-32 mb-1" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </header>

      <div className="p-6">
        {/* Staff Legend */}
        <div className="flex items-center justify-center space-x-8 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="w-full mb-8">
          <div className="grid w-full grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg h-14">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </div>

        {/* Calendar Content */}
        <Card>
          <CardContent className="p-4 sm:p-8">
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-20" />
            </div>

            {/* Mobile Timeline View */}
            <div className="block lg:hidden">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="w-4 h-4" />
                    </div>
                    <div className="space-y-2">
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 border-l-4 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32 mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6">
              {/* Time Column */}
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 flex items-center justify-center border-b border-border"
                  >
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>

              {/* Staff Columns */}
              {[1, 2].map((staffIndex) => (
                <div key={staffIndex} className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 border border-border rounded-lg p-2"
                    >
                      {i % 3 === 0 ? (
                        <div className="bg-blue-100 dark:bg-blue-900/20 rounded-md p-2 h-full">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      ) : i % 5 === 0 ? (
                        <div className="bg-green-100 dark:bg-green-900/20 rounded-md p-2 h-full">
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      ) : (
                        <Skeleton className="h-full w-full rounded-md" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function WeeklyCalendarSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Mobile Week View */}
        <div className="block lg:hidden">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-xs"
                    >
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Week Grid */}
        <div className="hidden lg:grid lg:grid-cols-8 gap-2">
          <Skeleton className="h-8 w-full" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="text-center p-2">
              <Skeleton className="h-4 w-8 mb-1 mx-auto" />
              <Skeleton className="h-6 w-6 mx-auto" />
            </div>
          ))}

          {/* Time slots */}
          {[...Array(16)].map((_, slotIndex) => (
            <div key={slotIndex} className="contents">
              <Skeleton className="h-16 w-full" />
              {[1, 2, 3, 4, 5, 6, 7].map((dayIndex) => (
                <div
                  key={dayIndex}
                  className="h-16 border border-border rounded-lg p-1"
                >
                  {(slotIndex + dayIndex) % 4 === 0 && (
                    <div className="bg-blue-100 dark:bg-blue-900/20 rounded-md p-1 h-full">
                      <Skeleton className="h-3 w-12" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyCalendarSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 lg:p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Mobile Month View */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["P", "S", "Ç", "P", "C", "C", "P"].map((_, index) => (
              <div key={index} className="text-center p-2">
                <Skeleton className="h-4 w-4 mx-auto" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, index) => (
              <div
                key={index}
                className="aspect-square border border-border rounded p-1"
              >
                <Skeleton className="h-3 w-3 mb-1" />
                {index % 3 === 0 && (
                  <div className="space-y-1">
                    <Skeleton className="w-full h-1 rounded" />
                    <Skeleton className="w-full h-1 rounded" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend for mobile */}
          <div className="flex items-center justify-center space-x-4 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="w-3 h-1 rounded mr-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Month Grid */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-2">
          {/* Day headers */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="text-center p-2">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}

          {/* Calendar days */}
          {[...Array(35)].map((_, index) => (
            <div
              key={index}
              className="h-24 border border-border rounded-lg p-1"
            >
              <Skeleton className="h-4 w-4 mb-1" />
              {index % 4 === 0 && (
                <Skeleton className="h-4 w-12 bg-blue-100 dark:bg-blue-900/20 rounded px-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
