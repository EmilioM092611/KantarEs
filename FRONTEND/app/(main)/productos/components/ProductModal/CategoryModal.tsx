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
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus } from "lucide-react";
import type { Categoria } from "@/lib/api/categorias";

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory: Categoria | null;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Categoria>) => Promise<void>;
}

export function CategoryModal({
  isOpen,
  editingCategory,
  onOpenChange,
  onSave,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<Partial<Categoria>>({
    nombre: "",
    descripcion: "",
    orden: 0,
    visible: true,
    activa: true,
  });

  useEffect(() => {
    if (editingCategory) {
      setFormData(editingCategory);
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        orden: 0,
        visible: true,
        activa: true,
      });
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = async () => {
    await onSave(formData);
    onOpenChange(false);
  };

  const isValid = formData.nombre && formData.nombre.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-neutral-950/35 backdrop-blur-md" />
        <DialogContent className="w-[min(96vw,600px)] max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-white rounded-2xl">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editingCategory ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              {editingCategory
                ? "Actualiza la información de la categoría"
                : "Ingresa los datos de la nueva categoría"}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="nombre"
                className="text-sm font-medium text-gray-700"
              >
                Nombre de la categoría *
              </Label>
              <Input
                id="nombre"
                value={formData.nombre || ""}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Ej: Bebidas, Alimentos, Postres"
                className="focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="descripcion"
                className="text-sm font-medium text-gray-700"
              >
                Descripción
              </Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={3}
                placeholder="Describe esta categoría..."
                className="resize-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="orden"
                className="text-sm font-medium text-gray-700"
              >
                Orden de visualización
              </Label>
              <Input
                id="orden"
                type="number"
                value={formData.orden || 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    orden: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                className="focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
              <p className="text-xs text-gray-500">
                Orden en el que aparecerá en el menú (menor número = más arriba)
              </p>
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
                {editingCategory ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Categoría
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
