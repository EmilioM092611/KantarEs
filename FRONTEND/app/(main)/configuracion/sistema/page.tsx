"use client";

// app/(dashboard)/sistema/page.tsx
// Página principal de configuración del sistema (MODULARIZADA)

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/fade-in";
import { SlideIn } from "@/components/slide-in";

// Hook personalizado
import { useConfiguracion } from "./hooks/useConfiguracion";

// Componentes
import {
  SistemaHeader,
  ConfiguracionGeneralComponent,
  ConfiguracionOperativaComponent,
  ConfiguracionFiscalComponent,
  ConfiguracionFoliosComponent,
  ConfiguracionAlertasComponent,
  ConfiguracionTurnosComponent,
} from "./components";

export default function SistemaPage() {
  const {
    // Estados
    isLoading,
    isSaving,
    activeTab,
    general,
    operativa,
    fiscal,
    folios,
    alertas,
    turnos,

    // Setters
    setActiveTab,
    setGeneral,
    setOperativa,
    setFiscal,
    setFolios,
    setAlertas,
    setTurnos,

    // Acciones
    guardarConfiguracion,
    restaurarDefaults,
    limpiarCache,
    agregarTurno,
    eliminarTurno,
  } = useConfiguracion();

  // Loading inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <SistemaHeader
          isSaving={isSaving}
          onSave={guardarConfiguracion}
          onRestaurarDefaults={restaurarDefaults}
        />
      </FadeIn>

      <SlideIn direction="up" delay={0.1}>
        <Tabs
          value={activeTab}
          onValueChange={(value: any) => setActiveTab(value)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="operativa">Operativa</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
            <TabsTrigger value="folios">Folios</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
            <TabsTrigger value="turnos">Turnos</TabsTrigger>
          </TabsList>

          {/* Configuración General */}
          <TabsContent value="general">
            {general && (
              <ConfiguracionGeneralComponent
                config={general}
                onChange={setGeneral}
              />
            )}
          </TabsContent>

          {/* Configuración Operativa */}
          <TabsContent value="operativa">
            {operativa && (
              <ConfiguracionOperativaComponent
                config={operativa}
                onChange={setOperativa}
              />
            )}
          </TabsContent>

          {/* Configuración Fiscal */}
          <TabsContent value="fiscal">
            {fiscal && (
              <ConfiguracionFiscalComponent
                config={fiscal}
                onChange={setFiscal}
              />
            )}
          </TabsContent>

          {/* Configuración de Folios */}
          <TabsContent value="folios">
            {folios && (
              <ConfiguracionFoliosComponent
                config={folios}
                onChange={setFolios}
              />
            )}
          </TabsContent>

          {/* Configuración de Alertas */}
          <TabsContent value="alertas">
            {alertas && (
              <ConfiguracionAlertasComponent
                config={alertas}
                onChange={setAlertas}
              />
            )}
          </TabsContent>

          {/* Configuración de Turnos */}
          <TabsContent value="turnos">
            {turnos && (
              <ConfiguracionTurnosComponent
                config={turnos}
                onChange={setTurnos}
                onAgregarTurno={agregarTurno}
                onEliminarTurno={eliminarTurno}
              />
            )}
          </TabsContent>
        </Tabs>
      </SlideIn>

      {/* Botón flotante para limpiar caché */}
      <div className="fixed bottom-8 right-8">
        <Button
          variant="outline"
          size="sm"
          onClick={limpiarCache}
          className="shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Limpiar Caché
        </Button>
      </div>
    </div>
  );
}
