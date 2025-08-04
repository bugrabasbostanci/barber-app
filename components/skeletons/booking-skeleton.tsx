import { Skeleton } from "@/components/ui/skeleton";

export function StaffSelectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-full p-5 rounded-xl border-2 border-gray-200 bg-gray-50"
        >
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <Skeleton className="w-12 h-12 rounded-full" />

            {/* Info */}
            <div className="flex-1">
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TimeSlotsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="p-4 rounded-xl border-2 border-gray-200">
          <div className="text-center">
            <Skeleton className="h-5 w-12 mx-auto mb-1" />
            <Skeleton className="h-3 w-8 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DateSelectionSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingStepSkeleton() {
  return (
    <div className="space-y-6 pb-24">
      {/* Step header */}
      <div className="text-center">
        <Skeleton className="w-12 h-12 mx-auto mb-4 rounded-full" />
        <Skeleton className="h-7 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Step content placeholder */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
