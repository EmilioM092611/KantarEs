import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import type { NewUserForm } from "../../types/usuarios.types";

interface UserModalStep2Props {
  user: NewUserForm;
  isEditing: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onUserChange: (user: NewUserForm) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  animationProps: any;
}

export function UserModalStep2({
  user,
  isEditing,
  showPassword,
  showConfirmPassword,
  onUserChange,
  onTogglePassword,
  onToggleConfirmPassword,
}: UserModalStep2Props) {
  const handleChange = (field: keyof NewUserForm, value: string) => {
    onUserChange({ ...user, [field]: value });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="group">
          <Label
            htmlFor="username"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
          >
            <User className="w-4 h-4 text-red-500" />
            Nombre de Usuario *
          </Label>
          <Input
            id="username"
            value={user.username}
            onChange={(e) =>
              handleChange(
                "username",
                e.target.value.replace(/\s+/g, "").toLowerCase()
              )
            }
            placeholder="Ej: jperez o juan.perez"
            className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white"
            required
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            Identificador único para iniciar sesión (sin espacios).
          </p>
        </div>
      </div>

      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-4 pt-4 border-t border-gray-200">
          <div className="group">
            <Label
              htmlFor="userPassword"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
            >
              <Lock className="w-4 h-4 text-red-500" />
              Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="userPassword"
                type={showPassword ? "text" : "password"}
                value={user.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white"
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onTogglePassword}
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-800"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usa mayúsculas, minúsculas, números y símbolos.
            </p>
          </div>

          <div className="group">
            <Label
              htmlFor="confirmPassword"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
            >
              <Lock className="w-4 h-4 text-red-500" />
              Confirmar Contraseña *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={user.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                placeholder="Repetir contraseña"
                className={`pr-10 border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white ${
                  user.confirmPassword && user.password !== user.confirmPassword
                    ? "border-red-500 ring-red-500"
                    : ""
                }`}
                required
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleConfirmPassword}
                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-7 w-7 text-gray-500 hover:text-gray-800"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación"
                    : "Mostrar confirmación"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {user.confirmPassword && user.password !== user.confirmPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Las contraseñas no coinciden.
              </p>
            )}
          </div>
        </div>
      )}

      {isEditing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <p>
            🔑 Para cambiar la contraseña de un usuario existente, utiliza la
            opción "Restablecer Contraseña" en la lista principal o en el perfil
            del usuario (si está implementado).
          </p>
        </div>
      )}
    </>
  );
}
