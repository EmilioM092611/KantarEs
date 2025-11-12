// components/dashboard/DashboardSkeleton.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Banner */}
      <div className="relative aspect-[16/5] w-full rounded-3xl overflow-hidden shadow-2xl bg-gray-100 animate-pulse" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-2xl">
            <CardHeader className="pb-3">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-2xl">
            <CardHeader className="pb-3">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 5 }).map((_, j) => (
                <div
                  key={j}
                  className="h-10 w-full bg-gray-100 rounded animate-pulse"
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
