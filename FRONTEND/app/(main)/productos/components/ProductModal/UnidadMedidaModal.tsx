import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Plus } from "lucide-react";
import type { UnidadMedida, TipoUnidad } from "@/lib/api/unidades-medida";

interface UnidadMedidaModalProps {
  isOpen: boolean;
  editingUnidad: UnidadMedida | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<UnidadMedida>) => Promise<void>;
}

export function UnidadMedidaModal({
  isOpen,
  editingUnidad,
  onOpenChange,
  onSave,
}: UnidadMedidaModalProps) {
  const [formData, setFormData] = useState<Partial<UnidadMedida>>({
    nombre: "",
    abreviatura: "",
    tipo: "UNIDAD",
    factor_conversion: 1,
  });

  useEffect(() => {
    if (editingUnidad) {
      setFormData(editingUnidad);
    } else {
      setFormData({
        nombre: "",
        abreviatura: "",
        tipo: "UNIDAD",
        factor_conversion: 1,
      });
    }
  }, [editingUnidad, isOpen]);

  const handleSubmit = async () => {
    await onSave(formData);
    onOpenChange(false);
  };

  const isValid =
    formData.nombre &&
    formData.nombre.trim().length > 0 &&
    formData.abreviatura &&
    formData.abreviatura.trim().length > 0 &&
    formData.tipo;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-neutral-950/35 backdrop-blur-md" />
        <DialogContent className="w-[min(96vw,600px)] max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-white rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingUnidad
                ? "Editar unidad de medida"
                : "Nueva unidad de medida"}
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              {editingUnidad
                ? "Actualiza la información de la unidad"
                : "Ingresa los datos de la nueva unidad de medida"}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nombre"
                  className="text-sm font-medium text-gray-700"
                >
                  Nombre *
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Kilogramo, Litro, Pieza"
                  className="focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="abreviatura"
                  className="text-sm font-medium text-gray-700"
                >
                  Abreviatura *
                </Label>
                <Input
                  id="abreviatura"
                  value={formData.abreviatura || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, abreviatura: e.target.value })
                  }
                  placeholder="Ej: kg, L, pz"
                  className="focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="tipo"
                  className="text-sm font-medium text-gray-700"
                >
                  Tipo *
                </Label>
                <Select
                  value={formData.tipo || "UNIDAD"}
                  onValueChange={(value: TipoUnidad) =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-red-300 focus:border-red-400">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="PESO">Peso</SelectItem>
                    <SelectItem value="VOLUMEN">Volumen</SelectItem>
                    <SelectItem value="UNIDAD">Unidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="factor_conversion"
                  className="text-sm font-medium text-gray-700"
                >
                  Factor de conversión
                </Label>
                <Input
                  id="factor_conversion"
                  type="number"
                  step="0.0001"
                  value={formData.factor_conversion || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      factor_conversion: parseFloat(e.target.value) || 1,
                    })
                  }
                  placeholder="1"
                  className="focus:ring-2 focus:ring-red-300 focus:border-red-400"
                />
                <p className="text-xs text-gray-500">
                  Factor de conversión a la unidad base
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid}
                className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              >
                {editingUnidad ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Unidad
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
