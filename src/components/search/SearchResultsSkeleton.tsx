import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResultsSkeletonProps {
  viewMode: 'list' | 'grid' | 'map';
  count?: number;
}

export const SearchResultsSkeleton = ({ viewMode, count = 8 }: SearchResultsSkeletonProps) => {
  const isGrid = viewMode === 'grid';

  const SkeletonCard = () => (
    <Card className={isGrid ? 'h-full' : ''}>
      <CardContent className={`p-4 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        <div className={isGrid ? 'flex flex-col h-full' : 'flex gap-4'}>
          {/* Image skeleton */}
          <div className={isGrid ? 'w-full mb-4' : 'w-20 h-20 flex-shrink-0'}>
            <Skeleton className={isGrid ? 'w-full h-32 rounded-lg' : 'w-20 h-20 rounded-lg'} />
          </div>

          {/* Info skeleton */}
          <div className={isGrid ? 'flex-1 space-y-3' : 'flex-1 min-w-0 space-y-3'}>
            <div className={isGrid ? 'text-center space-y-2' : 'space-y-2'}>
              <Skeleton className={`h-5 ${isGrid ? 'w-3/4 mx-auto' : 'w-48'}`} />
              <Skeleton className={`h-4 ${isGrid ? 'w-1/2 mx-auto' : 'w-32'}`} />
              <Skeleton className={`h-5 ${isGrid ? 'w-20 mx-auto' : 'w-20'}`} />
            </div>

            {/* Rating skeleton */}
            <div className={`flex items-center gap-4 ${isGrid ? 'justify-center' : ''}`}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Address skeleton */}
            <div className="space-y-2">
              <Skeleton className={`h-4 ${isGrid ? 'w-3/4 mx-auto' : 'w-full max-w-xs'}`} />
              <Skeleton className={`h-4 ${isGrid ? 'w-20 mx-auto' : 'w-24'}`} />
            </div>

            {/* Buttons skeleton */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 p-4">
      <div className={
        isGrid
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
      }>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};
