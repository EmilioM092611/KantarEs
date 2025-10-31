import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Edit3,
  X,
  Eye,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import type { UsuarioFrontend } from "@/lib/api/usuarios";
import {
  getUserInitials,
  getStatusColor,
  getRoleColor,
} from "../utils/usuarios.utils";

interface UserCardProps {
  user: UsuarioFrontend;
  delay?: number;
  onViewUser: (user: UsuarioFrontend) => void;
  onEditUser: (user: UsuarioFrontend) => void;
  onToggleStatus: (user: UsuarioFrontend) => void;
  processingUser: number | null;
}

/**
 * Componente de tarjeta individual de usuario
 */
export function UserCard({
  user,
  delay = 0,
  onViewUser,
  onEditUser,
  onToggleStatus,
  processingUser,
}: UserCardProps) {
  return (
    <FadeIn delay={delay}>
      <Card
        className="border-2 border-gray-200 hover:border-red-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group"
        onClick={() => onViewUser(user)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-gray-100 group-hover:border-red-200 transition-colors">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-xl">
                  {getUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                  {user.name}
                </h3>
                <Badge
                  className={`${getRoleColor(
                    user.role
                  )} border text-xs font-medium`}
                >
                  {user.role}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditUser(user);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(user);
                  }}
                  disabled={processingUser === user.id}
                >
                  {processingUser === user.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : user.status === "Activo" ? (
                    <X className="w-4 h-4 mr-2 text-red-500" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2 text-green-500" />
                  )}
                  {user.status === "Activo" ? "Desactivar" : "Activar"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>Último acceso: {user.lastLogin || "N/A"}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <Badge
              className={`${getStatusColor(
                user.status
              )} border text-xs font-medium`}
            >
              {user.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Creado: {user.joinDate || "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
