"use client"

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
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X, Trash2, UserPlus } from "lucide-react"

export default function UsuariosPage() {
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Rodo",
    email: "Rodo@kantares.com",
    phone: "+52 55 1234 5678",
    address: "Av. Revolución 123, Col. Centro, CDMX",
    role: "Administrador",
    joinDate: "15 de Enero, 2023",
    bio: "Administrador principal del restaurante KANTARES con más de 10 años de experiencia en el sector gastronómico.",
  })

  const [users] = useState([
    {
      id: 1,
      name: "Rodo",
      email: "Rodo@kantares.com",
      role: "Administrador",
      status: "Activo",
      lastLogin: "Hoy, 2:30 PM",
    },
    {
      id: 2,
      name: "María González",
      email: "maria.gonzalez@kantares.com",
      role: "Mesero",
      status: "Activo",
      lastLogin: "Ayer, 6:45 PM",
    },
    {
      id: 3,
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@kantares.com",
      role: "Cocinero",
      status: "Inactivo",
      lastLogin: "Hace 3 días",
    },
  ])

  const handleSaveProfile = () => {
    setEditingProfile(false)
    // Aquí iría la lógica para guardar los cambios
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra perfiles y permisos de usuarios</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          <TabsTrigger value="users">Usuarios del Sistema</TabsTrigger>
        </TabsList>

        {/* Mi Perfil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
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
                  <AvatarImage src="/restaurant-manager-avatar.png" />
                  <AvatarFallback className="bg-red-100 text-red-600 text-2xl font-semibold">JP</AvatarFallback>
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

          {/* Configuración de Seguridad */}
          <Card>
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
        </TabsContent>

        {/* Usuarios del Sistema Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>Administra todos los usuarios con acceso al sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback className="bg-red-100 text-red-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Último acceso: {user.lastLogin}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={user.status === "Activo" ? "default" : "secondary"}>{user.status}</Badge>
                      <Badge variant="outline">{user.role}</Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
