import { useState, useEffect, useMemo } from "react";
import type { UsuarioFrontend } from "@/lib/api/usuarios";
import type {
  NewUserForm,
  ProfileData,
  ViewMode,
  StepNumber,
} from "../types/usuarios.types";
import {
  calculateUserStats,
  filterUsers,
  paginateUsers,
  generateUsernameFromEmail,
} from "../utils/usuarios.utils";
import { ITEMS_PER_PAGE } from "../constants/usuarios.constants";
import { useAuth } from "@/hooks/useAuth";

export function useUsuariosPage() {
  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [viewingUser, setViewingUser] = useState<UsuarioFrontend | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioFrontend | null>(null);
  const [processingUser, setProcessingUser] = useState<number | null>(null);

  // Estados de filtros y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Estados del formulario
  const [newUser, setNewUser] = useState<NewUserForm>({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    permissions: [],
    gender: "",
    username: "",
    birthDate: "",
  });

  // Estados del perfil
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    joinDate: "",
    bio: "",
  });

  // Estados del modal con pasos
  const [step, setStep] = useState<StepNumber>(1);
  const [animationDirection, setAnimationDirection] = useState(1);

  // Estados de contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de éxito
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    description: "",
  });

  return {
    // View states
    viewMode,
    setViewMode,
    viewingUser,
    setViewingUser,
    editingProfile,
    setEditingProfile,
    userModalOpen,
    setUserModalOpen,
    editingUser,
    setEditingUser,
    processingUser,
    setProcessingUser,

    // Filter states
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,

    // Form states
    newUser,
    setNewUser,
    profileData,
    setProfileData,

    // Modal states
    step,
    setStep,
    animationDirection,
    setAnimationDirection,

    // Password states
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,

    // Success states
    showSuccessScreen,
    setShowSuccessScreen,
    successMessage,
    setSuccessMessage,
  };
}

/**
 * Hook para manejar la lógica de filtrado y paginación
 */
export function useUsuariosFilters(
  usuarios: UsuarioFrontend[],
  searchTerm: string,
  roleFilter: string,
  statusFilter: string,
  currentPage: number
) {
  // Calcular estadísticas
  const stats = useMemo(() => calculateUserStats(usuarios), [usuarios]);

  // Filtrar usuarios
  const filteredUsers = useMemo(
    () => filterUsers(usuarios, searchTerm, roleFilter, statusFilter),
    [usuarios, searchTerm, roleFilter, statusFilter]
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(
    () => paginateUsers(filteredUsers, currentPage, ITEMS_PER_PAGE),
    [filteredUsers, currentPage]
  );

  return {
    stats,
    filteredUsers,
    paginatedUsers,
    totalPages,
  };
}

/**
 * Hook para auto-generar username desde email
 */
export function useAutoGenerateUsername(
  email: string,
  username: string,
  editingUser: UsuarioFrontend | null,
  setNewUser: (user: any) => void
) {
  useEffect(() => {
    if (email && !username && !editingUser) {
      const generatedUsername = generateUsernameFromEmail(email);
      setNewUser((prev: any) => ({ ...prev, username: generatedUsername }));
    }
  }, [email, username, editingUser, setNewUser]);
}

/**
 * Hook para cargar datos del perfil del usuario autenticado
 */
export function useLoadUserProfile(
  currentUser: any,
  usuarios: UsuarioFrontend[],
  setProfileData: (data: ProfileData) => void
) {
  useEffect(() => {
    if (currentUser && usuarios.length > 0) {
      const userFullData = usuarios.find(
        (u) => u.email === currentUser.email || u.id === currentUser.id
      );

      if (userFullData) {
        setProfileData({
          name:
            userFullData.name ||
            currentUser.nombre ||
            currentUser.username ||
            "",
          email: userFullData.email || currentUser.email || "",
          phone: userFullData.phone || "",
          address: "",
          role: userFullData.role || currentUser.rol || "",
          joinDate: userFullData.joinDate || "",
          bio: userFullData.bio || "",
        });
      } else {
        setProfileData({
          name: currentUser.nombre || currentUser.username || "",
          email: currentUser.email || "",
          phone: "",
          address: "",
          role: currentUser.rol || "",
          joinDate: "",
          bio: "",
        });
      }
    }
  }, [currentUser, usuarios, setProfileData]);
}
