import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="px-4 py-6">
      {/* Profile Picture Section */}
      <div className="text-center mb-8">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
        <Skeleton className="h-7 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-36 mx-auto" />
      </div>

      {/* Personal Information Card */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-20" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form fields */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20 mb-2" />
              <div className="flex items-center mt-2">
                <Skeleton className="w-4 h-4 mr-3" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Settings Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}