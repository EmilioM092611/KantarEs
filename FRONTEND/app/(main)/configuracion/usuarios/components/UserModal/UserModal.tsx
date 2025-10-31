import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ContactRound, KeyRound, ListChecks } from "lucide-react";
import { UserModalStep1 } from "./UserModalStep1";
import { UserModalStep2 } from "./UserModalStep2";
import { UserModalStep3 } from "./UserModalStep3";
import { UserModalFooter } from "./UserModalFooter";
import {
  validateStep1,
  validateStep2,
  validateStep3,
} from "./UserModalValidations";
import { roles, permissions } from "../../constants/usuarios.constants";
import type { NewUserForm, StepNumber } from "../../types/usuarios.types";

interface UserModalProps {
  isOpen: boolean;
  editingUser: any;
  user: NewUserForm;
  step: StepNumber;
  showPassword: boolean;
  showConfirmPassword: boolean;
  animationDirection: number;
  onOpenChange: (open: boolean) => void;
  onUserChange: (user: NewUserForm) => void;
  onStepChange: (step: StepNumber) => void;
  onAnimationDirectionChange: (direction: number) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSave: () => void;
}

const steps = [
  { id: 1 as StepNumber, title: "Información Personal", icon: ContactRound },
  { id: 2 as StepNumber, title: "Cuenta y Seguridad", icon: KeyRound },
  { id: 3 as StepNumber, title: "Rol y Permisos", icon: ListChecks },
];

export function UserModal({
  isOpen,
  editingUser,
  user,
  step,
  showPassword,
  showConfirmPassword,
  animationDirection,
  onOpenChange,
  onUserChange,
  onStepChange,
  onAnimationDirectionChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSave,
}: UserModalProps) {
  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  const handleRoleChange = (roleValue: string) => {
    const selectedRole = roles.find((r) => r.value === roleValue);
    if (selectedRole) {
      onUserChange({
        ...user,
        role: roleValue,
        permissions: selectedRole.permissions.includes("all")
          ? permissions.map((p) => p.id)
          : selectedRole.permissions,
      });
    }
  };

  const goNext = () => {
    if (step < 3) {
      onAnimationDirectionChange(1);
      onStepChange((step + 1) as StepNumber);
    }
  };

  const goBack = () => {
    if (step > 1) {
      onAnimationDirectionChange(-1);
      onStepChange((step - 1) as StepNumber);
    }
  };

  const progressPct = Math.round((step / 3) * 100);

  const { isValid: isStep1Valid } = validateStep1(user);
  const { isValid: isStep2Valid } = validateStep2(user, !!editingUser);
  const { isValid: isStep3Valid } = validateStep3(user);

  const animationProps = {
    custom: animationDirection,
    initial: { opacity: 0, x: animationDirection * 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: animationDirection * -50 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-neutral-950/35 backdrop-blur-md saturate-75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:duration-150 data-[state=closed]:duration-100" />

        <DialogContent className="w-[min(96vw,1200px)] max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-gradient-to-br from-white via-red-50/30 to-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:duration-200 data-[state=closed]:duration-150 data-[state=open]:ease-out data-[state=closed]:ease-in">
          <DialogHeader className="pb-4 border-b-2 border-red-100">
            <div className="flex items-center gap-4">
              <div>
                <DialogTitle className="text-3xl font-bold text-gray-900">
                  {editingUser ? "Editar usuario" : "Crear usuario"}
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {editingUser
                    ? `Actualiza la información de ${editingUser.name}`
                    : "Ingresa los datos requeridos para registrar un nuevo usuario en el sistema"}
                </p>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map(({ id, title, icon: Icon }) => {
                  const active = step === id;
                  const done = step > id;
                  return (
                    <div
                      key={id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300 shadow-sm
                    ${
                      active
                        ? "border-red-500 bg-red-50/80 ring-2 ring-red-200"
                        : done
                        ? "border-emerald-300 bg-emerald-50/70"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }
                  `}
                    >
                      <div
                        className={`h-9 w-9 flex items-center justify-center rounded-lg text-white shadow-inner
                      ${
                        active
                          ? "bg-gradient-to-br from-red-500 to-red-700"
                          : done
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                          : "bg-gray-400"
                      }
                    `}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium uppercase tracking-wider ${
                            active
                              ? "text-red-700"
                              : done
                              ? "text-emerald-700"
                              : "text-gray-500"
                          }`}
                        >
                          Paso {id}
                        </p>
                        <p
                          className={`text-sm font-semibold leading-tight whitespace-normal break-words ${
                            active
                              ? "text-red-900"
                              : done
                              ? "text-emerald-900"
                              : "text-gray-800"
                          }`}
                        >
                          {title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra de progreso */}
              <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-700 transition-[width] duration-500 ease-out rounded-full"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="relative pt-6 overflow-hidden">
            <AnimatePresence mode="wait" custom={animationDirection}>
              {step === 1 && (
                <motion.div key={1} {...animationProps} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <ContactRound className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Información Personal del Usuario
                    </h3>
                  </div>

                  <UserModalStep1
                    user={user}
                    onUserChange={onUserChange}
                    animationProps={{}}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key={2} {...animationProps} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <KeyRound className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cuenta y Seguridad
                    </h3>
                  </div>

                  <UserModalStep2
                    user={user}
                    isEditing={!!editingUser}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    onUserChange={onUserChange}
                    onTogglePassword={onTogglePassword}
                    onToggleConfirmPassword={onToggleConfirmPassword}
                    animationProps={{}}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key={3} {...animationProps} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                    <ListChecks className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Rol y Permisos del Usuario
                    </h3>
                  </div>

                  <UserModalStep3
                    user={user}
                    onUserChange={onUserChange}
                    onRoleChange={handleRoleChange}
                    animationProps={{}}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <UserModalFooter
            step={step}
            isEditing={!!editingUser}
            isStep1Valid={isStep1Valid}
            isStep2Valid={isStep2Valid}
            isStep3Valid={isStep3Valid}
            onPrevious={goBack}
            onNext={goNext}
            onSave={onSave}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
