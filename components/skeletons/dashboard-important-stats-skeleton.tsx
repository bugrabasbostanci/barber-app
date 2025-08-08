import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardImportantStatsSkeleton() {
  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <Skeleton className="h-9 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Appointments Skeleton */}
      <div>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}