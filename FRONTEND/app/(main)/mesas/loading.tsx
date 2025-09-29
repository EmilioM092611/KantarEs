import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MesasLoading() {
  return (
    <div className="p-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Buttons Skeleton */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      {/* Restaurant Floor Plan Skeleton */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50 rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-gray-200">
                <div className="text-center space-y-2">
                  <Skeleton className="h-6 w-16 mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
