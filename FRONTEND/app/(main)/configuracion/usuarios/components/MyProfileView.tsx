import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  User,
  FileText,
  ShieldCheck,
  Bell,
  Lock,
  Edit3,
} from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import { FadeIn } from "@/components/fade-in";
import { useState } from "react";

interface MyProfileViewProps {
  currentUser: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
    joinDate?: string;
    address?: string;
    bio?: string;
  };
  onEditProfile?: () => void;
  onChangePassword?: () => void;
}

/**
 * Vista de perfil del usuario actual
 */
export function MyProfileView({
  currentUser,
  onEditProfile,
  onChangePassword,
}: MyProfileViewProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    const roleColors: Record<string, string> = {
      Administrador: "bg-red-100 text-red-700 border-red-200",
      Admin: "bg-red-100 text-red-700 border-red-200",
      Gerente: "bg-blue-100 text-blue-700 border-blue-200",
      Manager: "bg-blue-100 text-blue-700 border-blue-200",
      Bartender: "bg-purple-100 text-purple-700 border-purple-200",
      Mesero: "bg-green-100 text-green-700 border-green-200",
      Waiter: "bg-green-100 text-green-700 border-green-200",
      Cajero: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Cashier: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Cocinero: "bg-orange-100 text-orange-700 border-orange-200",
      Chef: "bg-orange-100 text-orange-700 border-orange-200",
    };

    return roleColors[role] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <SlideIn direction="up" delay={0.1}>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Información Personal
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Gestiona tu información de perfil
                </p>
              </div>
              {onEditProfile && (
                <Button
                  onClick={onEditProfile}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>

            {/* Avatar y nombre principal */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200">
              <Avatar className="h-24 w-24 border-4 border-red-100 shadow-lg">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-red-600 to-red-700 text-white">
                  {getUserInitials(currentUser.name || "Usuario")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {currentUser.name || "Nombre no disponible"}
                </h3>
                <Badge
                  className={`${getRoleBadgeColor(
                    currentUser.role || "Usuario"
                  )} border text-sm font-medium px-3 py-1.5`}
                >
                  {currentUser.role || "Sin rol asignado"}
                </Badge>
              </div>
            </div>

            {/* Grid de información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre Completo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Nombre Completo</span>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-6">
                  {currentUser.name || "No disponible"}
                </p>
              </div>

              {/* Correo Electrónico */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Correo Electrónico
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-6 break-all">
                  {currentUser.email || "No disponible"}
                </p>
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Teléfono</span>
                </div>
                <p className="text-base text-gray-500 italic ml-6">
                  {currentUser.phone || "No registrado"}
                </p>
              </div>

              {/* Dirección */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Dirección</span>
                </div>
                <p className="text-base text-gray-500 italic ml-6">
                  {currentUser.address || "No registrada"}
                </p>
              </div>

              {/* Fecha de Ingreso */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Fecha de Ingreso</span>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-6">
                  {currentUser.joinDate || "No disponible"}
                </p>
              </div>

              {/* Rol del Sistema */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Rol del Sistema</span>
                </div>
                <p className="text-base font-semibold text-gray-900 ml-6">
                  {currentUser.role || "No asignado"}
                </p>
              </div>
            </div>

            {/* Biografía / Notas */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Biografía / Notas</span>
              </div>
              <p className="text-base text-gray-500 italic ml-6">
                {currentUser.bio || "Sin biografía"}
              </p>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Configuración de Seguridad */}
      <SlideIn direction="up" delay={0.2}>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Configuración de Seguridad
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu contraseña y ajustes de seguridad
              </p>
            </div>

            <div className="space-y-4">
              {/* Autenticación de dos factores (2FA) */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Autenticación de dos factores (2FA)
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Añade una capa extra de seguridad a tu cuenta
                      (recomendado)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>

              {/* Notificaciones por Correo */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Notificaciones por Correo
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Recibe alertas sobre actividad importante en tu cuenta
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>

              {/* Botón Cambiar Contraseña */}
              {onChangePassword && (
                <Button
                  onClick={onChangePassword}
                  variant="outline"
                  className="w-full mt-6 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  );
}
