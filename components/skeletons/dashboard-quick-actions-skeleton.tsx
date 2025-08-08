import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardQuickActionsSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-7 w-24 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Skeleton className="w-5 h-5 mr-2" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}