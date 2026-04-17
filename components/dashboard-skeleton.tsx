import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
              <Skeleton className="mt-2 h-3 w-24" />
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
              <Skeleton className="mt-2 h-3 w-24" />
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-7 w-28" />
              <Skeleton className="mt-2 h-3 w-24" />
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <Card className="p-5 xl:col-span-4">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="mt-1 h-3 w-64" />
          <Skeleton className="mt-4 h-[280px] w-full" />
        </Card>
        <Card className="p-5 xl:col-span-8">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="mt-1 h-3 w-72" />
          <Skeleton className="mt-4 h-[280px] w-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1 h-3 w-48" />
          <Skeleton className="mt-4 h-[260px] w-full" />
        </Card>
        <Card className="p-5 lg:col-span-8">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-1 h-3 w-72" />
          <Skeleton className="mt-4 h-[320px] w-full" />
        </Card>
      </div>

      <Card className="p-5">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-1 h-3 w-64" />
        <Skeleton className="mt-4 h-[300px] w-full" />
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1 h-3 w-56" />
            <Skeleton className="mt-4 h-[220px] w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
