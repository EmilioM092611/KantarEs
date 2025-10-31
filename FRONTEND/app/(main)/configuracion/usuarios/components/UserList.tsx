import { UserCard } from "./UserCard";
import { UserCardSkeleton } from "./UserCardSkeleton";
import { AlertCircle } from "lucide-react";
import type { UsuarioFrontend } from "@/lib/api/usuarios";

interface UserListProps {
  users: UsuarioFrontend[];
  isLoading: boolean;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  processingUser: number | null;
  onViewUser: (user: UsuarioFrontend) => void;
  onEditUser: (user: UsuarioFrontend) => void;
  onToggleStatus: (user: UsuarioFrontend) => void;
}

/**
 * Componente que muestra la lista de usuarios con su estado de carga y vacío
 */
export function UserList({
  users,
  isLoading,
  searchTerm,
  roleFilter,
  statusFilter,
  processingUser,
  onViewUser,
  onEditUser,
  onToggleStatus,
}: UserListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
        <p className="text-gray-500 text-sm mt-2">
          {searchTerm || roleFilter !== "all" || statusFilter !== "all"
            ? "Intenta ajustar los filtros de búsqueda"
            : "Aún no hay usuarios registrados en el sistema."}
        </p>
      </div>
    );
  }

  // Users grid
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {users.map((user, index) => (
        <UserCard
          key={user.id}
          user={user}
          delay={0.05 * index}
          onViewUser={onViewUser}
          onEditUser={onEditUser}
          onToggleStatus={onToggleStatus}
          processingUser={processingUser}
        />
      ))}
    </div>
  );
}
