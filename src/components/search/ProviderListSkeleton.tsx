import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProviderListSkeletonProps {
  count?: number;
  className?: string;
}

const SkeletonRow = memo(({ index }: { index: number }) => (
  <div 
    className="px-4 py-3 border-b border-border/50 animate-fade-in"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="flex items-start gap-3">
      {/* Avatar skeleton */}
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Name row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
        
        {/* Specialty */}
        <Skeleton className="h-3 w-24" />

        {/* Meta row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>

      {/* Action skeleton */}
      <Skeleton className="w-8 h-8 rounded-md opacity-0" />
    </div>

    {/* Address skeleton */}
    <div className="mt-1.5 pl-[52px]">
      <Skeleton className="h-3 w-48" />
    </div>
  </div>
));

SkeletonRow.displayName = 'SkeletonRow';

export const ProviderListSkeleton = memo(({ count = 6, className }: ProviderListSkeletonProps) => {
  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Header skeleton */}
      <div className="px-4 h-11 border-b border-border flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
      
      {/* List skeleton */}
      <div className="flex-1 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonRow key={index} index={index} />
        ))}
      </div>
    </div>
  );
});

ProviderListSkeleton.displayName = 'ProviderListSkeleton';
