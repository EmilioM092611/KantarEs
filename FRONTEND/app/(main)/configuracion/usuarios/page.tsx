"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Trash2,
  UserPlus,
  MoreHorizontal,
  Eye,
  Lock,
  Users,
  Settings,
  AlertCircle,
} from "lucide-react"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"

interface UserData {
  id: number
  name: string
  email: string
  phone?: string
  role: string
  status: "Activo" | "Inactivo" | "Suspendido"
  lastLogin: string
  joinDate: string
  permissions: string[]
  avatar?: string
}

const roles = [
  { value: "administrador", label: "Administrador", permissions: ["all"] },
  { value: "gerente", label: "Gerente", permissions: ["ventas", "inventario", "reportes", "usuarios"] },
  { value: "mesero", label: "Mesero", permissions: ["ventas", "mesas"] },
  { value: "cocinero", label: "Cocinero", permissions: ["cocina", "inventario"] },
  { value: "cajero", label: "Cajero", permissions: ["ventas", "cortes"] },
  { value: "hostess", label: "Hostess", permissions: ["mesas", "reservaciones"] },
]

const permissions = [
  { id: "ventas", label: "Gestión de Ventas", description: "Crear y gestionar órdenes" },
  { id: "mesas", label: "Gestión de Mesas", description: "Abrir, cerrar y gestionar mesas" },
  { id: "inventario", label: "Inventario", description: "Gestionar productos e inventario" },
  { id: "reportes", label: "Reportes", description: "Ver y generar reportes" },
  { id: "usuarios", label: "Usuarios", description: "Gestionar usuarios del sistema" },
  { id: "configuracion", label: "Configuración", description: "Configurar el sistema" },
  { id: "finanzas", label: "Finanzas", description: "Gestionar finanzas y cortes" },
  { id: "cocina", label: "Cocina", description: "Gestionar órdenes de cocina" },
]

export default function UsuariosPage() {
  const [editingProfile, setEditingProfile] = useState(false)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [profileData, setProfileData] = useState({
    name: "KantarEs",
    email: "ejemplo@kantares.com",
    phone: "+52 55 1234 5678",
    address: "Av. Revolución 123, Col. Centro, CDMX",
    role: "Administrador",
    joinDate: "15 de Enero, 2023",
    bio: "Administrador principal del restaurante KANTARES con más de 10 años de experiencia en el sector gastronómico.",
  })

  const [users, setUsers] = useState<UserData[]>([
    {
      id: 1,
      name: "Rodo",
      email: "Rodo@kantares.com",
      phone: "+52 55 1234 5678",
      role: "Administrador",
      status: "Activo",
      lastLogin: "Hoy, 2:30 PM",
      joinDate: "15 de Enero, 2023",
      permissions: ["all"],
    },
    {
      id: 2,
      name: "María González",
      email: "maria.gonzalez@kantares.com",
      phone: "+52 55 9876 5432",
      role: "Mesero",
      status: "Activo",
      lastLogin: "Ayer, 6:45 PM",
      joinDate: "20 de Marzo, 2023",
      permissions: ["ventas", "mesas"],
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@kantares.com",
      phone: "+52 55 5555 1234",
      role: "Cocinero",
      status: "Inactivo",
      lastLogin: "Hace 3 días",
      joinDate: "10 de Febrero, 2023",
      permissions: ["cocina", "inventario"],
    },
    {
      id: 4,
      name: "Ana Martínez",
      email: "ana.martinez@kantares.com",
      phone: "+52 55 7777 8888",
      role: "Gerente",
      status: "Activo",
      lastLogin: "Hoy, 1:15 PM",
      joinDate: "5 de Enero, 2023",
      permissions: ["ventas", "inventario", "reportes", "usuarios"],
    },
    {
      id: 5,
      name: "Luis Hernández",
      email: "luis.hernandez@kantares.com",
      phone: "+52 55 3333 4444",
      role: "Cajero",
      status: "Suspendido",
      lastLogin: "Hace 1 semana",
      joinDate: "15 de Abril, 2023",
      permissions: ["ventas", "cortes"],
    },
  ])

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    confirmPassword: "",
    permissions: [] as string[],
  })

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const handleSaveProfile = () => {
    setEditingProfile(false)
    // Aquí iría la lógica para guardar los cambios
  }

  const openUserModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user)
      setNewUser({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role.toLowerCase(),
        password: "",
        confirmPassword: "",
        permissions: user.permissions,
      })
    } else {
      setEditingUser(null)
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "",
        password: "",
        confirmPassword: "",
        permissions: [],
      })
    }
    setUserModalOpen(true)
  }

  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: roles.find((r) => r.value === newUser.role)?.label || newUser.role,
                permissions: newUser.permissions,
              }
            : user,
        ),
      )
    } else {
      // Create new user
      const newUserData: UserData = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: roles.find((r) => r.value === newUser.role)?.label || newUser.role,
        status: "Activo",
        lastLogin: "Nunca",
        joinDate: new Date().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        permissions: newUser.permissions,
      }
      setUsers([...users, newUserData])
    }
    setUserModalOpen(false)
  }

  const deleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  const toggleUserStatus = (id: number) => {
    setUsers(
      users.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "Activo" ? "Inactivo" : ("Activo" as "Activo" | "Inactivo" | "Suspendido"),
            }
          : user,
      ),
    )
  }

  const handleRoleChange = (roleValue: string) => {
    const selectedRole = roles.find((r) => r.value === roleValue)
    setNewUser({
      ...newUser,
      role: roleValue,
      permissions: selectedRole?.permissions || [],
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200"
      case "Inactivo":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "Suspendido":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrador":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "gerente":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "mesero":
        return "bg-green-100 text-green-800 border-green-200"
      case "cocinero":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "cajero":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hostess":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neutral-900 via-black to-neutral-900 bg-clip-text text-transparent">
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Administra perfiles y permisos de usuarios del sistema</p>
          </div>
          <Button
            onClick={() => openUserModal()}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </FadeIn>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: "Total Usuarios",
            value: users.length.toString(),
            change: "+2 este mes",
            icon: Users,
            gradient: "from-blue-500 to-blue-600",
          },
          {
            title: "Usuarios Activos",
            value: users.filter((u) => u.status === "Activo").length.toString(),
            change: `${((users.filter((u) => u.status === "Activo").length / users.length) * 100).toFixed(0)}% del total`,
            icon: User,
            gradient: "from-green-500 to-green-600",
          },
          {
            title: "Roles Diferentes",
            value: new Set(users.map((u) => u.role)).size.toString(),
            change: "Bien distribuido",
            icon: Shield,
            gradient: "from-purple-500 to-purple-600",
          },
          {
            title: "Usuarios Suspendidos",
            value: users.filter((u) => u.status === "Suspendido").length.toString(),
            change: "Requieren atención",
            icon: AlertCircle,
            gradient: "from-red-500 to-red-600",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className="bg-white shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    <p className="text-gray-600 text-xs mt-1">{stat.change}</p>
                  </div>
                  <div
                    className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center`}
                  >
                    {React.createElement(stat.icon, { className: "w-5 h-5 text-white" })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      <SlideIn direction="up" delay={0.1}>
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="users" className="text-base">
              <Users className="h-4 w-4 mr-2" />
              Usuarios del Sistema
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-base">
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          {/* Usuarios del Sistema Tab */}
          <TabsContent value="users" className="space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-red-600" />
                      Usuarios del Sistema ({filteredUsers.length})
                    </CardTitle>
                    <CardDescription>Administra todos los usuarios con acceso al sistema</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-4"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Suspendido">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Users List */}
                  <div className="space-y-4">
                    {filteredUsers.map((user, index) => (
                      <SlideIn key={user.id} direction="up" delay={0.3 + index * 0.1}>
                        <div className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group bg-white">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-red-100 text-red-600 font-semibold">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                                  {user.name}
                                </h4>
                                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                              </div>
                              <p className="text-gray-600 font-medium">{user.email}</p>
                              {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span>Último acceso: {user.lastLogin}</span>
                                <span>•</span>
                                <span>Ingresó: {user.joinDate}</span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                {user.permissions.slice(0, 3).map((permission) => (
                                  <Badge key={permission} variant="outline" className="text-xs">
                                    {permissions.find((p) => p.id === permission)?.label || permission}
                                  </Badge>
                                ))}
                                {user.permissions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{user.permissions.length - 3} más
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openUserModal(user)}>
                                  <Edit3 className="h-4 w-4 mr-2" />
                                  Editar Usuario
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                                  <Lock className="h-4 w-4 mr-2" />
                                  {user.status === "Activo" ? "Desactivar" : "Activar"}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Permisos
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteUser(user.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </SlideIn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          {/* Mi Perfil Tab */}
          <TabsContent value="profile" className="space-y-6">
            <SlideIn direction="up" delay={0.2}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Perfil del Administrador</CardTitle>
                      <CardDescription>Gestiona tu información personal y configuración</CardDescription>
                    </div>
                    {!editingProfile ? (
                      <Button
                        variant="outline"
                        onClick={() => setEditingProfile(true)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} className="bg-red-600 hover:bg-red-700">
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                        <Button variant="outline" onClick={() => setEditingProfile(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-red-100 text-red-600 text-2xl font-semibold">KE</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-semibold text-gray-900">{profileData.name}</h3>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                          <Shield className="w-3 h-3 mr-1" />
                          {profileData.role}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{profileData.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4" />
                          Nombre Completo
                        </Label>
                        {editingProfile ? (
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{profileData.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4" />
                          Correo Electrónico
                        </Label>
                        {editingProfile ? (
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{profileData.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4" />
                          Teléfono
                        </Label>
                        {editingProfile ? (
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{profileData.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <MapPin className="w-4 h-4" />
                          Dirección
                        </Label>
                        {editingProfile ? (
                          <Textarea
                            id="address"
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            className="mt-1"
                            rows={2}
                          />
                        ) : (
                          <p className="mt-1 text-gray-900">{profileData.address}</p>
                        )}
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Calendar className="w-4 h-4" />
                          Fecha de Ingreso
                        </Label>
                        <p className="mt-1 text-gray-900">{profileData.joinDate}</p>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Shield className="w-4 h-4" />
                          Rol del Sistema
                        </Label>
                        <p className="mt-1 text-gray-900">{profileData.role}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                      Biografía
                    </Label>
                    {editingProfile ? (
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="mt-1 text-gray-700">{profileData.bio}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>

            <SlideIn direction="up" delay={0.3}>
              <Card className="transition-smooth hover:shadow-lg">
                <CardHeader>
                  <CardTitle>Configuración de Seguridad</CardTitle>
                  <CardDescription>Gestiona tu contraseña y configuración de seguridad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Autenticación de dos factores</Label>
                      <p className="text-sm text-gray-600">Añade una capa extra de seguridad a tu cuenta</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Notificaciones por email</Label>
                      <p className="text-sm text-gray-600">Recibe alertas de actividad importante</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Cambiar Contraseña
                  </Button>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>
        </Tabs>
      </SlideIn>

      {/* User Creation/Edit Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userName">Nombre Completo *</Label>
                <Input
                  id="userName"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Ej: Juan Pérez García"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Correo Electrónico *</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Ej: juan.perez@kantares.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="userPhone">Teléfono</Label>
                <Input
                  id="userPhone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Ej: +52 55 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="userRole">Rol del Sistema *</Label>
                <Select value={newUser.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          {role.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password Section (only for new users) */}
            {!editingUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="userPassword">Contraseña *</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                    placeholder="Repetir contraseña"
                  />
                </div>
              </div>
            )}

            {/* Permissions Section */}
            <div>
              <Label className="text-base font-semibold mb-4 block">Permisos del Sistema</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={permission.id}
                      checked={newUser.permissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewUser({
                            ...newUser,
                            permissions: [...newUser.permissions, permission.id],
                          })
                        } else {
                          setNewUser({
                            ...newUser,
                            permissions: newUser.permissions.filter((p) => p !== permission.id),
                          })
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="font-medium cursor-pointer">
                        {permission.label}
                      </Label>
                      <p className="text-sm text-gray-600">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setUserModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveUser}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                disabled={
                  !newUser.name ||
                  !newUser.email ||
                  !newUser.role ||
                  (!editingUser && (!newUser.password || newUser.password !== newUser.confirmPassword))
                }
              >
                {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
