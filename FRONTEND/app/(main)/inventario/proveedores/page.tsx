"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  FileText,
  Star,
} from "lucide-react"

interface Proveedor {
  id: number
  nombre: string
  contacto: string
  telefono: string
  email: string
  direccion: string
  categoria: string
  estado: "activo" | "inactivo" | "pendiente"
  calificacion: number
  ultimoPedido: string
  totalCompras: number
  productos: string[]
  notas: string
}

const proveedoresData: Proveedor[] = [
  {
    id: 1,
    nombre: "Carnes Premium S.A.",
    contacto: "Juan Carlos Mendoza",
    telefono: "+52 55 1234-5678",
    email: "ventas@carnespremium.com",
    direccion: "Av. Central 123, CDMX",
    categoria: "Carnes",
    estado: "activo",
    calificacion: 4.8,
    ultimoPedido: "2024-01-10",
    totalCompras: 125000,
    productos: ["Res", "Cerdo", "Pollo", "Cordero"],
    notas: "Excelente calidad, entrega puntual",
  },
  {
    id: 2,
    nombre: "Verduras Frescas del Valle",
    contacto: "María Elena Rodríguez",
    telefono: "+52 55 2345-6789",
    email: "pedidos@verdurasfrescas.mx",
    direccion: "Mercado Central 45, Estado de México",
    categoria: "Verduras",
    estado: "activo",
    calificacion: 4.5,
    ultimoPedido: "2024-01-12",
    totalCompras: 85000,
    productos: ["Tomate", "Cebolla", "Lechuga", "Zanahoria"],
    notas: "Productos orgánicos certificados",
  },
  {
    id: 3,
    nombre: "Lácteos La Hacienda",
    contacto: "Roberto Sánchez",
    telefono: "+52 55 3456-7890",
    email: "contacto@lacteoshacienda.com",
    direccion: "Rancho La Esperanza, Querétaro",
    categoria: "Lácteos",
    estado: "pendiente",
    calificacion: 4.2,
    ultimoPedido: "2024-01-08",
    totalCompras: 65000,
    productos: ["Leche", "Queso", "Crema", "Mantequilla"],
    notas: "Revisión de precios pendiente",
  },
  {
    id: 4,
    nombre: "Especias y Condimentos del Sur",
    contacto: "Ana Patricia López",
    telefono: "+52 55 4567-8901",
    email: "ventas@especiasdelsur.com",
    direccion: "Calle Hidalgo 78, Oaxaca",
    categoria: "Condimentos",
    estado: "activo",
    calificacion: 4.9,
    ultimoPedido: "2024-01-11",
    totalCompras: 45000,
    productos: ["Chiles", "Especias", "Hierbas", "Sal"],
    notas: "Productos artesanales de alta calidad",
  },
]

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(proveedoresData)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")

  const estadisticas = {
    totalProveedores: proveedores.length,
    activos: proveedores.filter((p) => p.estado === "activo").length,
    pendientes: proveedores.filter((p) => p.estado === "pendiente").length,
    totalCompras: proveedores.reduce((sum, p) => sum + p.totalCompras, 0),
    calificacionPromedio: proveedores.reduce((sum, p) => sum + p.calificacion, 0) / proveedores.length,
  }

  const proveedoresFiltrados = proveedores.filter((proveedor) => {
    const coincideBusqueda =
      proveedor.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === "todos" || proveedor.categoria === filtroCategoria
    const coincideEstado = filtroEstado === "todos" || proveedor.estado === filtroEstado

    return coincideBusqueda && coincideCategoria && coincideEstado
  })

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-700 border-green-200"
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "inactivo":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "activo":
        return <CheckCircle className="w-4 h-4" />
      case "pendiente":
        return <Clock className="w-4 h-4" />
      case "inactivo":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  return (
    <div className="p-8 space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
            <p className="text-gray-600 mt-1">Administra tus proveedores y relaciones comerciales</p>
          </div>
          <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
            <DialogTrigger asChild>
              <Button className="gradient-wine text-white transition-smooth hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Proveedor</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de la empresa</Label>
                  <Input id="nombre" placeholder="Ej: Carnes Premium S.A." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contacto">Persona de contacto</Label>
                  <Input id="contacto" placeholder="Ej: Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="+52 55 1234-5678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contacto@empresa.com" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" placeholder="Calle, número, colonia, ciudad" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carnes">Carnes</SelectItem>
                      <SelectItem value="verduras">Verduras</SelectItem>
                      <SelectItem value="lacteos">Lácteos</SelectItem>
                      <SelectItem value="condimentos">Condimentos</SelectItem>
                      <SelectItem value="bebidas">Bebidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select defaultValue="activo">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="notas">Notas adicionales</Label>
                  <Textarea id="notas" placeholder="Información adicional sobre el proveedor..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </Button>
                <Button className="gradient-wine text-white">Guardar Proveedor</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </FadeIn>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          {
            title: "Total Proveedores",
            value: estadisticas.totalProveedores,
            icon: Building2,
            color: "bg-blue-50 border-blue-200 text-blue-700",
            iconColor: "text-blue-600",
          },
          {
            title: "Activos",
            value: estadisticas.activos,
            icon: CheckCircle,
            color: "bg-green-50 border-green-200 text-green-700",
            iconColor: "text-green-600",
          },
          {
            title: "Pendientes",
            value: estadisticas.pendientes,
            icon: Clock,
            color: "bg-yellow-50 border-yellow-200 text-yellow-700",
            iconColor: "text-yellow-600",
          },
          {
            title: "Total Compras",
            value: `$${estadisticas.totalCompras.toLocaleString()}`,
            icon: DollarSign,
            color: "bg-purple-50 border-purple-200 text-purple-700",
            iconColor: "text-purple-600",
          },
          {
            title: "Calificación Promedio",
            value: estadisticas.calificacionPromedio.toFixed(1),
            icon: Star,
            color: "bg-orange-50 border-orange-200 text-orange-700",
            iconColor: "text-orange-600",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className={`${stat.color} border transition-smooth hover:shadow-lg hover:scale-105`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <SlideIn direction="up" delay={0.6}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar proveedores..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  <SelectItem value="Carnes">Carnes</SelectItem>
                  <SelectItem value="Verduras">Verduras</SelectItem>
                  <SelectItem value="Lácteos">Lácteos</SelectItem>
                  <SelectItem value="Condimentos">Condimentos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Lista de proveedores */}
      <SlideIn direction="up" delay={0.7}>
        <Card className="transition-smooth hover:shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Proveedores</CardTitle>
            <CardDescription>{proveedoresFiltrados.length} proveedores encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proveedoresFiltrados.map((proveedor, index) => (
                <SlideIn key={proveedor.id} direction="up" delay={0.8 + index * 0.1}>
                  <div className="border rounded-lg p-6 hover:bg-gray-50 transition-smooth hover:scale-[1.02]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <Building2 className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{proveedor.nombre}</h3>
                            <p className="text-sm text-gray-600">{proveedor.contacto}</p>
                          </div>
                          <Badge className={getEstadoColor(proveedor.estado)}>
                            {getEstadoIcon(proveedor.estado)}
                            <span className="ml-1 capitalize">{proveedor.estado}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {proveedor.telefono}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {proveedor.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {proveedor.direccion}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-xs text-gray-500">Categoría</p>
                              <p className="font-medium">{proveedor.categoria}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Total Compras</p>
                              <p className="font-medium">${proveedor.totalCompras.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Último Pedido</p>
                              <p className="font-medium">{proveedor.ultimoPedido}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Calificación</p>
                              <div className="flex items-center gap-1">
                                {renderStars(proveedor.calificacion)}
                                <span className="text-sm font-medium ml-1">{proveedor.calificacion}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="transition-smooth hover:scale-105 bg-transparent"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="transition-smooth hover:scale-105 bg-transparent"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:bg-red-50 transition-smooth hover:scale-105 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SlideIn>
              ))}
            </div>
          </CardContent>
        </Card>
      </SlideIn>
    </div>
  )
}
