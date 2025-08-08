import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardCriticalStatsSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton className="h-7 w-16 mb-4" />
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-2 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="p-6 text-center">
            <Skeleton className="h-12 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}