import { BookingStepSkeleton } from "@/components/skeletons/booking-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Step indicator skeleton */}
      <div className="px-4 py-2 bg-white border-b">
        <div className="h-4 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
      </div>

      {/* Progress bar skeleton */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((stepNum) => (
            <div
              key={stepNum}
              className="flex-1 h-2 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 py-8">
        <BookingStepSkeleton />
      </div>

      {/* Navigation skeleton */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex space-x-3">
          <div className="flex-1 h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1 h-14 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}