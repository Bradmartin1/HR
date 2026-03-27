import { CardSkeleton, Skeleton } from "@/components/shared/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} className="h-24" />
        ))}
      </div>
    </div>
  );
}
