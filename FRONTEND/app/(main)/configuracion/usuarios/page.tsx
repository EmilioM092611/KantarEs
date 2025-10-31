"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2, Users, User } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { useUsuarios } from "@/hooks/useUsuarios";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SuccessScreenPremium } from "@/components/SuccessScreenPremium";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Importaciones modularizadas
import {
  UserStatistics,
  UserFilters,
  UserList,
  Pagination,
  UserModal,
  UserDetailView,
} from "./components";
import { MyProfileView } from "./components/MyProfileView";
import {
  useUsuariosPage,
  useUsuariosFilters,
  useAutoGenerateUsername,
  useLoadUserProfile,
} from "./hooks/useUsuariosPage";
import { ITEMS_PER_PAGE } from "./constants/usuarios.constants";

/**
 * Página principal de gestión de usuarios
 * REFACTORIZADA Y MODULARIZADA CON USERDETAILVIEW MEJORADO
 */
export default function UsuariosPage() {
  const { toast } = useToast();
  const {
    usuarios,
    isLoading,
    error,
    cargarUsuarios,
    crearUsuario,
    actualizarUsuario,
    desactivarUsuario,
    activarUsuario,
  } = useUsuarios();

  // Obtener el usuario autenticado
  const { user: currentUser, loading: authLoading } = useAuth(true);

  // Hook personalizado para manejar todos los estados
  const {
    viewMode,
    setViewMode,
    viewingUser,
    setViewingUser,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    processingUser,
    setProcessingUser,
    newUser,
    setNewUser,
    userModalOpen,
    setUserModalOpen,
    editingUser,
    setEditingUser,
    step,
    setStep,
    animationDirection,
    setAnimationDirection,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    showSuccessScreen,
    setShowSuccessScreen,
    successMessage,
    setSuccessMessage,
  } = useUsuariosPage();

  // Hook para filtrado y paginación
  const { stats, filteredUsers, paginatedUsers, totalPages } =
    useUsuariosFilters(
      usuarios,
      searchTerm,
      roleFilter,
      statusFilter,
      currentPage
    );

  // Hook para auto-generar username
  useAutoGenerateUsername(
    newUser.email,
    newUser.username,
    editingUser,
    setNewUser
  );

  // Hook para cargar perfil del usuario
  useLoadUserProfile(currentUser, usuarios, () => {});

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, setCurrentPage]);

  // Mostrar mensaje de error si hay
  useEffect(() => {
    if (error) {
      toast({
        title: "Error cargando datos",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handlers
  const handleViewUser = (user: any) => {
    setViewingUser(user);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setViewingUser(null);
  };

  /**
   * ✅ MEJORADO: Ahora con toast de éxito y actualización del viewingUser
   */
  const handleToggleUserStatus = async (user: any) => {
    try {
      setProcessingUser(user.id);

      if (user.status === "Activo") {
        await desactivarUsuario(user.id);
        toast({
          title: "Usuario desactivado",
          description: `${user.name} ya no puede acceder al sistema`,
          variant: "destructive",
        });
      } else {
        await activarUsuario(user.id);
        toast({
          title: "Usuario activado",
          description: `${user.name} puede acceder al sistema nuevamente`,
        });
      }

      await cargarUsuarios();

      // ✅ NUEVO: Actualizar viewingUser si estamos en la vista de detalle
      if (viewingUser && viewingUser.id === user.id) {
        const updatedUser = usuarios.find((u) => u.id === user.id);
        if (updatedUser) {
          setViewingUser(updatedUser);
        }
      }
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      toast({
        title: "Error",
        description:
          error.message || "No se pudo cambiar el estado del usuario",
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const openUserModal = (user?: any) => {
    setShowSuccessScreen(false);
    if (user) {
      setEditingUser(user);
      setNewUser({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role.toLowerCase(),
        password: "",
        confirmPassword: "",
        permissions: user.permissions || [],
        gender: "",
        username: user.username || user.email.split("@")[0],
        birthDate: user.birthDate || "",
      });
    } else {
      setEditingUser(null);
      setNewUser({
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
    }
    setStep(1);
    setAnimationDirection(1);
    setUserModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        const datosActualizacion = {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          username: newUser.username,
          birthDate: newUser.birthDate,
        };

        await actualizarUsuario(editingUser.id, datosActualizacion);

        setUserModalOpen(false);
        setSuccessMessage({
          title: "¡Usuario Actualizado!",
          description: `${newUser.name} ha sido actualizado correctamente.`,
        });
        setShowSuccessScreen(true);

        // Recargar la lista de usuarios
        await cargarUsuarios();

        // Si estamos viendo el detalle del usuario, actualizar el viewingUser
        if (viewingUser && viewingUser.id === editingUser.id) {
          // Actualizar el viewingUser con los nuevos datos
          setViewingUser({
            ...viewingUser,
            ...datosActualizacion,
          });
        }

        setTimeout(() => {
          setShowSuccessScreen(false);
        }, 2500);
      } else {
        if (!newUser.password || newUser.password.trim() === "") {
          toast({
            title: "Contraseña requerida",
            description:
              "Por favor ingresa una contraseña para el nuevo usuario",
            variant: "destructive",
          });
          return;
        }

        if (newUser.password !== newUser.confirmPassword) {
          toast({
            title: "Las contraseñas no coinciden",
            description: "Verifica que ambas contraseñas sean idénticas",
            variant: "destructive",
          });
          return;
        }

        await crearUsuario({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          password: newUser.password,
          username: newUser.username,
          birthDate: newUser.birthDate,
        });

        setUserModalOpen(false);
        setSuccessMessage({
          title: "¡Usuario Creado!",
          description: `${newUser.name} ha sido creado correctamente.`,
        });
        setShowSuccessScreen(true);

        setTimeout(() => {
          setShowSuccessScreen(false);
          cargarUsuarios();
        }, 2500);
      }
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);

      const errorMessage = error.message?.toLowerCase() || "";

      if (
        errorMessage.includes("email") ||
        errorMessage.includes("username") ||
        errorMessage.includes("ya existe")
      ) {
        toast({
          title: "Usuario duplicado",
          description: "Ya existe un usuario con ese email o nombre de usuario",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al guardar",
          description: error.message || "No se pudo guardar el usuario",
          variant: "destructive",
        });
      }
    }
  };

  // Mostrar loader mientras carga la autenticación
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header - FIJO, fuera del AnimatePresence */}
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2">
              Administra perfiles y permisos de usuarios del sistema
            </p>
          </div>
          <Button
            onClick={() => openUserModal()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all"
            disabled={isLoading}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </FadeIn>

      <AnimatePresence mode="wait">
        {viewMode === "list" ? (
          <motion.div
            key="lista-usuarios"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {/* Statistics Cards */}
            <UserStatistics stats={stats} />

            {/* Tabs - Solo en vista de lista */}
            <FadeIn delay={0.3}>
              <Tabs defaultValue="usuarios" className="w-full mt-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger
                    value="usuarios"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Usuarios del Sistema
                  </TabsTrigger>
                  <TabsTrigger
                    value="perfil"
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="usuarios" className="mt-6">
                  {/* Filters */}
                  <UserFilters
                    searchTerm={searchTerm}
                    roleFilter={roleFilter}
                    statusFilter={statusFilter}
                    onSearchChange={setSearchTerm}
                    onRoleChange={setRoleFilter}
                    onStatusChange={setStatusFilter}
                  />

                  {/* User List */}
                  <UserList
                    users={paginatedUsers}
                    isLoading={isLoading}
                    searchTerm={searchTerm}
                    roleFilter={roleFilter}
                    statusFilter={statusFilter}
                    processingUser={processingUser}
                    onViewUser={handleViewUser}
                    onEditUser={openUserModal}
                    onToggleStatus={handleToggleUserStatus}
                  />

                  {/* Pagination */}
                  {!isLoading && filteredUsers.length > ITEMS_PER_PAGE && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </TabsContent>

                <TabsContent value="perfil" className="mt-6">
                  {currentUser ? (
                    <MyProfileView
                      currentUser={{
                        id: currentUser.id || 0,
                        name: currentUser.nombre || currentUser.name || "",
                        email: currentUser.email || "",
                        phone: currentUser.phone || currentUser.telefono,
                        role: currentUser.rol || currentUser.role || "",
                        avatar: currentUser.avatar || currentUser.photoURL,
                        joinDate:
                          currentUser.joinDate ||
                          currentUser.fechaRegistro ||
                          currentUser.createdAt,
                        address: currentUser.address || currentUser.direccion,
                        bio:
                          currentUser.bio ||
                          currentUser.biografia ||
                          currentUser.description,
                      }}
                      onEditProfile={() => openUserModal(currentUser)}
                      onChangePassword={() => {
                        toast({
                          title: "Cambiar Contraseña",
                          description: "Funcionalidad en desarrollo",
                        });
                      }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">
                        No se pudo cargar la información del usuario
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </FadeIn>
          </motion.div>
        ) : (
          <motion.div
            key="detalle-usuario"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {viewingUser && (
              <UserDetailView
                user={viewingUser}
                stats={stats}
                onBack={handleBackToList}
                onEdit={openUserModal}
                onNewUser={() => openUserModal()}
                onToggleStatus={handleToggleUserStatus} // ✅ AGREGADO: Nueva prop
                isLoading={isLoading}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Modal */}
      <UserModal
        isOpen={userModalOpen}
        editingUser={editingUser}
        user={newUser}
        step={step}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        animationDirection={animationDirection}
        onOpenChange={setUserModalOpen}
        onUserChange={setNewUser}
        onStepChange={setStep}
        onAnimationDirectionChange={setAnimationDirection}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onToggleConfirmPassword={() =>
          setShowConfirmPassword(!showConfirmPassword)
        }
        onSave={handleSaveUser}
      />

      {/* Success Screen */}
      <SuccessScreenPremium
        isOpen={showSuccessScreen}
        onClose={() => setShowSuccessScreen(false)}
        variant={editingUser ? "edit" : "create"}
        title={successMessage.title}
        description={successMessage.description}
        userName={newUser.name}
        autoCloseDelay={2500}
        accentColor="rgb(239, 68, 68)"
        showCloseButton={true}
      />
    </div>
  );
}
