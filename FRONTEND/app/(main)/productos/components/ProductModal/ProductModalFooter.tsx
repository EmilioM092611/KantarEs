import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Save, Plus } from "lucide-react";

type StepNumber = 1 | 2 | 3;

interface ProductModalFooterProps {
  step: StepNumber;
  isEditing: boolean;
  isStep1Valid: boolean;
  isStep2Valid: boolean;
  isStep3Valid: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}

export function ProductModalFooter({
  step,
  isEditing,
  isStep1Valid,
  isStep2Valid,
  isStep3Valid,
  onPrevious,
  onNext,
  onSave,
}: ProductModalFooterProps) {
  return (
    <DialogFooter className="mt-6 pt-6 border-t-2 border-gray-200 sm:justify-between">
      <p className="text-left text-xs text-gray-500 mb-2 sm:mb-0">
        * Campos obligatorios para guardar
      </p>
      <div className="flex items-center justify-end gap-2">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="group transition-all duration-200 ease-out hover:bg-gray-100 hover:border-gray-400 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Anterior
          </Button>
        )}

        {step < 3 ? (
          <Button
            type="button"
            onClick={onNext}
            className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95"
            disabled={
              (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid)
            }
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onSave}
            className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-3 group-active:-rotate-3" />
                Guardar Cambios
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-3 group-active:-rotate-3" />
                Crear Producto
              </>
            )}
          </Button>
        )}
      </div>
    </DialogFooter>
  );
}
