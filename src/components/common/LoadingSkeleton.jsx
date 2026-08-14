import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function LoadingSkeleton({ variant = 'split' }) {
  if (variant === 'grid') {
    return (
      <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl bg-indigo-500/20" />
            <Skeleton className="h-8 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="bg-white/40 dark:bg-black/20 border border-border/50 backdrop-blur-sm p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="w-12 h-12 rounded-2xl bg-indigo-500/15" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
              <div className="pt-4 border-t border-border/40 flex justify-between items-center">
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-28 h-9 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Default 'split' view skeleton (Worksheets, Essays, Flashcards)
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl bg-emerald-500/20" />
          <Skeleton className="h-8 w-72 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-[480px] max-w-full rounded-lg" />
      </div>

      {/* 2-Column Split Skeleton */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Form Skeleton */}
        <Card className="xl:col-span-5 bg-white/40 dark:bg-black/20 border border-border/50 backdrop-blur-sm p-6 rounded-2xl space-y-6 h-fit">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-60 rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-28 rounded-lg" />
              <Skeleton className="h-7 w-32 rounded-lg" />
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <Skeleton className="h-12 w-full rounded-xl bg-emerald-500/20" />
        </Card>

        {/* Right Output Skeleton */}
        <Card className="xl:col-span-7 bg-white/40 dark:bg-black/20 border border-border/50 backdrop-blur-sm p-8 rounded-2xl space-y-6 min-h-[460px] flex flex-col justify-center items-center">
          <Skeleton className="w-16 h-16 rounded-full bg-emerald-500/15 mb-2" />
          <Skeleton className="h-6 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 max-w-full rounded-md" />
          <div className="w-full space-y-3 mt-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    </div>
  );
}
