"use client"

import { LoadingSpinner } from "./loading-spinner"

interface ModuleLoaderProps {
  moduleName: string
  description?: string
}

export function ModuleLoader({ moduleName, description }: ModuleLoaderProps) {
  return (
    <>
      {/* Overlay que cubre TODA la pantalla */}
      <div 
        className="fixed inset-0 bg-white/90 backdrop-blur-md"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh'
        }}
      />
      
      {/* Contenido del loader centrado */}
      <div 
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 10000 }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cargando {moduleName}</h2>
              {description && <p className="text-gray-600">{description}</p>}
            </div>
            <LoadingSpinner size="md" text="Preparando módulo..." />
          </div>
        </div>
      </div>
    </>
  )
}