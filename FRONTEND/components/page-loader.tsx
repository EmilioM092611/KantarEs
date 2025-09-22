"use client"

import { LoadingSpinner } from "./loading-spinner"

interface PageLoaderProps {
  text?: string
  fullScreen?: boolean
}

export function PageLoader({ text = "Cargando...", fullScreen = true }: PageLoaderProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <LoadingSpinner size="lg" text={text} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
