import { Skeleton } from '@/components/feedback/Skeleton.jsx';

export function ProductCardSkeleton() {
  return (
    <div
      className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
      aria-hidden="true"
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
