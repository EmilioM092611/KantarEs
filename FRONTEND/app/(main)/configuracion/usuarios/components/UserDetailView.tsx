import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  ChevronLeft,
  User,
  Clock,
  Edit3,
  Users,
  Loader2,
  X,
  Eye,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { SlideIn } from "@/components/slide-in";
import { FadeIn } from "@/components/fade-in";
import type { UsuarioFrontend } from "@/lib/api/usuarios";
import {
  getUserInitials,
  getStatusColor,
  getRoleColor,
} from "../utils/usuarios.utils";
import { permissions } from "../constants/usuarios.constants";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserDetailViewProps {
  user: UsuarioFrontend;
  stats: {
    total: number;
    activos: number;
    suspendidos: number;
    rolesUnicos: number;
    porcentajeActivos: number;
  };
  onBack: () => void;
  onEdit: (user: UsuarioFrontend) => void;
  onNewUser: () => void;
  onToggleStatus: (userId: number) => Promise<void>; // Nueva prop para manejar cambio de estado
  isLoading?: boolean;
}

/**
 * Vista de detalle completa de un usuario - Versión Mejorada
 * Incluye toast notifications, activar/desactivar usuario, y mejor feedback
 */
export function UserDetailView({
  user,
  stats,
  onBack,
  onEdit,
  onNewUser,
  onToggleStatus,
  isLoading = false,
}: UserDetailViewProps) {
  const { toast } = useToast();
  const [processingUser, setProcessingUser] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "activate" | "deactivate" | null
  >(null);

  /**
   * Maneja el toggle de estado del usuario con confirmación
   */
  const handleToggleUserStatus = async () => {
    if (!pendingAction) return;

    try {
      setProcessingUser(true);
      await onToggleStatus(user.id);

      // Toast de éxito
      if (pendingAction === "deactivate") {
        toast({
          title: "Usuario desactivado",
          description: `${user.name} ya no puede acceder al sistema`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Usuario activado",
          description: `${user.name} puede acceder al sistema nuevamente`,
        });
      }

      setShowConfirmDialog(false);
      setPendingAction(null);
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      toast({
        title: "Error",
        description:
          error.message || "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      });
    } finally {
      setProcessingUser(false);
    }
  };

  /**
   * Abre el diálogo de confirmación
   */
  const openConfirmDialog = (action: "activate" | "deactivate") => {
    setPendingAction(action);
    setShowConfirmDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards - Igual que en la vista principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SlideIn direction="up" delay={0.1}>
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Usuarios
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.total}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">+2 este mes</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <Users className="w-7 h-7 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        <SlideIn direction="up" delay={0.2}>
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Usuarios Activos
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.activos}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.porcentajeActivos}% del total
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <User className="w-7 h-7 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        <SlideIn direction="up" delay={0.3}>
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Roles Diferentes
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.rolesUnicos}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Bien distribuido</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>

        <SlideIn direction="up" delay={0.4}>
          <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.03]">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Suspendidos
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.suspendidos}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Requieren atención
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <Clock className="w-7 h-7 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Botón para volver */}
      <FadeIn delay={0.5}>
        <Button
          variant="outline"
          onClick={onBack}
          className="transition-all hover:scale-105"
          disabled={processingUser}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Volver a la lista
        </Button>
      </FadeIn>

      {/* Header con Avatar y Botones de Acción */}
      <SlideIn direction="up" delay={0.6}>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-red-100 shadow-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-red-600 to-red-700 text-white">
                    {getUserInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {user.name}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <Mail className="w-4 h-4" />
                    <span className="text-base break-all">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${getRoleColor(
                        user.role
                      )} border text-sm font-medium px-3 py-1.5`}
                    >
                      <Shield className="w-3.5 h-3.5 mr-1.5" />
                      {user.role}
                    </Badge>
                    <Badge
                      className={`${getStatusColor(
                        user.status
                      )} border text-sm font-medium px-3 py-1.5`}
                    >
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Botón Activar/Desactivar */}
                <Button
                  onClick={() =>
                    openConfirmDialog(
                      user.status === "Activo" ? "deactivate" : "activate"
                    )
                  }
                  disabled={processingUser}
                  variant={user.status === "Activo" ? "destructive" : "default"}
                  className={
                    user.status === "Activo"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }
                >
                  {processingUser ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : user.status === "Activo" ? (
                    <X className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  {user.status === "Activo" ? "Desactivar" : "Activar"}
                </Button>

                {/* Botón Editar Usuario */}
                <Button
                  onClick={() => onEdit(user)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md"
                  disabled={processingUser}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar Usuario
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Grid de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* ID Usuario */}
        <SlideIn direction="up" delay={0.7}>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">
                ID USUARIO
              </p>
              <p className="text-xl font-bold text-gray-900">#{user.id}</p>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Username */}
        <SlideIn direction="up" delay={0.8}>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">USERNAME</p>
              <p className="text-xl font-bold text-gray-900">
                {user.username || "N/A"}
              </p>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Teléfono */}
        <SlideIn direction="up" delay={0.9}>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">TELÉFONO</p>
              <p className="text-xl font-bold text-gray-900">
                {user.phone || "No reg."}
              </p>
            </CardContent>
          </Card>
        </SlideIn>

        {/* Permisos */}
        <SlideIn direction="up" delay={1.0}>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">PERMISOS</p>
              <p className="text-xl font-bold text-gray-900">
                {user.permissions?.length || 0} módulos
              </p>
            </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <SlideIn direction="up" delay={1.1}>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">
                FECHA REGISTRO
              </p>
              <p className="text-base font-bold text-gray-900">
                {user.joinDate || "N/A"}
              </p>
            </CardContent>
          </Card>
        </SlideIn>

        <SlideIn direction="up" delay={1.2}>
          <Card className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">
                ÚLTIMO ACCESO
              </p>
              <p className="text-base font-bold text-gray-900">
                {user.lastLogin || "Nunca"}
              </p>
            </CardContent>
          </Card>
        </SlideIn>
      </div>

      {/* Permisos y Accesos */}
      <SlideIn direction="up" delay={1.3}>
        <Card className="border-none shadow-md mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Permisos y Accesos Asignados
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Módulos y funcionalidades a las que tiene acceso este usuario
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {user.permissions && user.permissions.length > 0 ? (
                user.permissions.map((permId) => {
                  const perm = permissions.find((p) => p.id === permId);
                  return perm ? (
                    <div
                      key={permId}
                      className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all"
                    >
                      <ShieldCheck className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {perm.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {perm.description}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                    <AlertCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-base mb-1">
                    Sin permisos asignados
                  </p>
                  <p className="text-gray-400 text-sm">
                    Este usuario no tiene permisos específicos configurados
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Diálogo de Confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction === "deactivate"
                ? "¿Desactivar usuario?"
                : "¿Activar usuario?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction === "deactivate" ? (
                <>
                  Estás a punto de desactivar a <strong>{user.name}</strong>.
                  Este usuario no podrá acceder al sistema hasta que sea
                  reactivado.
                </>
              ) : (
                <>
                  Estás a punto de activar a <strong>{user.name}</strong>. Este
                  usuario podrá acceder al sistema nuevamente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingUser}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleUserStatus}
              disabled={processingUser}
              className={
                pendingAction === "deactivate"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {processingUser ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : pendingAction === "deactivate" ? (
                "Sí, desactivar"
              ) : (
                "Sí, activar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
