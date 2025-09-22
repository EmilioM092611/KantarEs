"use client"

import { LoadingSpinner } from "./loading-spinner"
import { Card, CardContent } from "@/components/ui/card"

interface ModuleLoaderProps {
  moduleName: string
  description?: string
}

export function ModuleLoader({ moduleName, description }: ModuleLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Cargando {moduleName}</h2>
            {description && <p className="text-gray-600 text-sm">{description}</p>}
          </div>
          <LoadingSpinner size="md" text="Preparando módulo..." />
        </CardContent>
      </Card>
    </div>
  )
}
