import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSecondaryStatsSkeleton() {
  return (
    <div className="mb-4">
      <Skeleton className="h-5 w-28 mb-3" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <Skeleton className="h-9 w-12 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}