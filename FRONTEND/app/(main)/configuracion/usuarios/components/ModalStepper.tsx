import { ContactRound, KeyRound, ListChecks } from "lucide-react";
import type { StepNumber } from "../types/usuarios.types";

interface ModalStepperProps {
  currentStep: StepNumber;
  progressPct: number;
}

const steps = [
  { id: 1 as const, title: "Información del Usuario", icon: ContactRound },
  { id: 2 as const, title: "Cuenta & Seguridad", icon: KeyRound },
  { id: 3 as const, title: "Roles & Permisos", icon: ListChecks },
];

/**
 * Componente Stepper para el modal de crear/editar usuario
 */
export function ModalStepper({ currentStep, progressPct }: ModalStepperProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Barra de progreso */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Indicadores de pasos */}
      <div className="flex items-center justify-between relative">
        {steps.map((s, idx) => {
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;
          const IconComponent = s.icon;

          return (
            <div key={s.id} className="flex flex-col items-center flex-1">
              <div
                className={`
                  relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300
                  ${
                    isActive
                      ? "border-red-500 bg-red-500 text-white shadow-lg scale-110"
                      : isCompleted
                      ? "border-red-500 bg-red-100 text-red-600"
                      : "border-gray-300 bg-white text-gray-400"
                  }
                `}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <p
                className={`
                  text-xs mt-2 font-medium text-center transition-colors
                  ${
                    isActive
                      ? "text-red-600"
                      : isCompleted
                      ? "text-red-500"
                      : "text-gray-500"
                  }
                `}
              >
                {s.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
