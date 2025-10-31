import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { roles, permissions } from "../../constants/usuarios.constants";
import { getUserInitials, getRoleColor } from "../../utils/usuarios.utils";
import type { NewUserForm } from "../../types/usuarios.types";

interface UserModalStep3Props {
  user: NewUserForm;
  onUserChange: (user: NewUserForm) => void;
  onRoleChange: (roleValue: string) => void;
  animationProps: any;
}

export function UserModalStep3({
  user,
  onUserChange,
  onRoleChange,
}: UserModalStep3Props) {
  const togglePermission = (permissionId: string) => {
    if (user.role === "administrador") return;

    const newPermissions = user.permissions.includes(permissionId)
      ? user.permissions.filter((p) => p !== permissionId)
      : [...user.permissions, permissionId];

    onUserChange({ ...user, permissions: newPermissions });
  };

  return (
    <>
      {/* Rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="group">
          <Label
            htmlFor="userRole"
            className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
          >
            <Shield className="w-4 h-4 text-red-500" />
            Rol del Sistema *
          </Label>
          <Select value={user.role} onValueChange={onRoleChange}>
            <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500 bg-white">
              <SelectValue placeholder="Seleccionar rol principal" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex items-center gap-2">{role.label}</div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Define el nivel de acceso base. Los permisos se ajustarán
            automáticamente.
          </p>
        </div>
      </div>

      {/* Resumen compacto */}
      <div className="mt-5">
        <p className="text-sm font-medium text-gray-800 mb-2">
          Resumen del Usuario:
        </p>
        <div className="rounded-xl border bg-gradient-to-r from-white to-gray-50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-gray-200 flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 font-semibold text-lg">
                {getUserInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 w-full text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Nombre
                </p>
                <p className="font-medium text-gray-900 truncate">
                  {user.name || (
                    <span className="italic text-gray-400">No definido</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Correo
                </p>
                <p className="font-medium text-gray-900 truncate">
                  {user.email || (
                    <span className="italic text-gray-400">No definido</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Usuario
                </p>
                <p className="font-medium text-gray-900 truncate">
                  {user.username || (
                    <span className="italic text-gray-400">No definido</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Rol Seleccionado
                </p>
                {user.role ? (
                  <Badge
                    variant="outline"
                    className={`mt-0.5 ${getRoleColor(
                      user.role
                    )} border font-medium`}
                  >
                    {roles.find((r) => r.value === user.role)?.label}
                  </Badge>
                ) : (
                  <span className="italic text-gray-400">No definido</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 border-t pt-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">
              Permisos Asignados ({user.permissions.length}):
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {user.permissions.length === 0 ? (
                <Badge
                  variant="outline"
                  className="border-dashed border-gray-300 text-gray-500"
                >
                  Ninguno (según rol)
                </Badge>
              ) : (
                <>
                  {user.permissions.slice(0, 5).map((pid) => {
                    const p = permissions.find((pp) => pp.id === pid);
                    return (
                      <Badge
                        key={pid}
                        variant="secondary"
                        className="bg-rose-100/70 text-rose-800 border-rose-200 px-2 py-0.5"
                      >
                        {p?.label ?? pid}
                      </Badge>
                    );
                  })}
                  {user.permissions.length > 5 && (
                    <Badge
                      variant="outline"
                      className="border-gray-300 text-gray-600 px-2 py-0.5"
                    >
                      +{user.permissions.length - 5} más...
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permisos (Ajustables) */}
      <div className="mt-5 space-y-3">
        <Label className="text-sm font-medium text-gray-800">
          Ajustar Permisos Específicos (Opcional)
        </Label>
        <p className="text-xs text-gray-600">
          Selecciona o deselecciona módulos para personalizar el acceso más allá
          del rol base. El rol 'Administrador' siempre tendrá todos los
          permisos.
        </p>

        {/* Contenedor de permisos con scroll si son muchos */}
        <div className="max-h-[300px] overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {permissions.map((permission, index) => {
              const isChecked = user.permissions.includes(permission.id);
              const isDisabled = user.role === "administrador";

              return (
                <FadeIn key={permission.id} delay={0.02 * index}>
                  <div
                    className={`
                      flex items-start space-x-3 p-3 border rounded-lg transition-all duration-200
                      ${
                        isDisabled
                          ? "bg-gray-100 opacity-70 cursor-not-allowed"
                          : "cursor-pointer hover:shadow-md"
                      }
                      ${
                        isChecked
                          ? "border-red-400 bg-red-50/60 shadow-sm"
                          : "border-gray-200 bg-white hover:border-red-300"
                      }
                    `}
                    onClick={() =>
                      !isDisabled && togglePermission(permission.id)
                    }
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`
                          h-4 w-4 rounded border-2 flex items-center justify-center transition-all
                          ${
                            isChecked
                              ? "border-red-500 bg-red-500"
                              : "border-gray-400 bg-white"
                          }
                          ${isDisabled ? "border-gray-300 bg-gray-300" : ""}
                        `}
                      >
                        {isChecked && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <Label
                        className={`font-semibold text-sm ${
                          isDisabled
                            ? "text-gray-500"
                            : "cursor-pointer text-gray-900"
                        }`}
                      >
                        {permission.label}
                      </Label>
                      <p
                        className={`text-xs mt-0.5 ${
                          isDisabled ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {permission.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
