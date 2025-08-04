import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 pb-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-64 mx-auto mb-8" />
        
        {/* CTA Button */}
        <Skeleton className="w-full h-16 rounded-2xl" />
      </div>

      {/* Services Section */}
      <div className="mb-8">
        <Skeleton className="h-6 w-32 mx-auto mb-6" />
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="text-center p-6 bg-gray-50 rounded-2xl">
          <Skeleton className="w-8 h-8 mx-auto mb-2" />
          <Skeleton className="h-5 w-16 mx-auto mb-1" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
        <div className="text-center p-6 bg-gray-50 rounded-2xl">
          <Skeleton className="w-8 h-8 mx-auto mb-2" />
          <Skeleton className="h-5 w-24 mx-auto mb-1" />
          <Skeleton className="h-4 w-28 mx-auto" />
        </div>
      </div>

      {/* Hours Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <Skeleton className="w-full h-16 rounded-2xl" />
    </div>
  );
}