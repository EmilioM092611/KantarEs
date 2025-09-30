// components/dashboard/DashboardSkeleton.tsx

import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Una función de utilidad para crear un bloque gris animado.
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded-md ${className}`} />
);

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Skeleton para el Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <SkeletonBlock className="h-9 w-64 mb-2" />
          <SkeletonBlock className="h-5 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-10 w-80" />
          <SkeletonBlock className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Skeleton para el Banner */}
      <SkeletonBlock className="h-96 rounded-2xl" />

      {/* Skeleton para las Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SkeletonBlock className="h-40 rounded-2xl" />
        <SkeletonBlock className="h-40 rounded-2xl" />
        <SkeletonBlock className="h-40 rounded-2xl" />
        <SkeletonBlock className="h-40 rounded-2xl" />
      </div>

      {/* Skeleton para una sección de módulos */}
      <div>
        <SkeletonBlock className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};
