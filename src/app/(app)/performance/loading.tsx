import { TableSkeleton, Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <TableSkeleton rows={6} />
    </div>
  );
}
