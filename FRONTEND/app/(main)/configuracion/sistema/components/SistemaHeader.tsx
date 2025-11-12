// app/(dashboard)/sistema/components/SistemaHeader.tsx
// Header de la página de configuración del sistema

import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SistemaHeaderProps {
  isSaving: boolean;
  onSave: () => void;
  onRestaurarDefaults: () => void;
}

export const SistemaHeader = ({
  isSaving,
  onSave,
  onRestaurarDefaults,
}: SistemaHeaderProps) => {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Configuración del sistema
        </h1>
        <p className="text-gray-600 mt-1">
          Administra la configuración general del restaurante
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onRestaurarDefaults}
          disabled={isSaving}
          className="border-orange-200 text-orange-600 hover:bg-orange-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Restaurar Defaults
        </Button>
        <Button
          variant="outline"
          onClick={logout}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-red-600 hover:bg-red-700"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};
