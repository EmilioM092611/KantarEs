"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Plus, Edit, Trash2, CalendarIcon, Tag, TrendingUp, Users, Eye, EyeOff, Copy } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Promocion {
  id: number
  titulo: string
  descripcion: string
  descuento: string
  tipo: "porcentaje" | "monto_fijo" | "2x1" | "combo"
  valor: number
  imagen: string
  activa: boolean
  fecha_inicio: Date
  fecha_fin: Date
  usos: number
  limite_usos?: number
  productos_aplicables: string[]
  condiciones: string
  codigo?: string
  fecha_creacion: Date
}

const promocionesData: Promocion[] = [
  {
    id: 1,
    titulo: "Martes de Tacos",
    descripcion: "2x1 en todos los tacos los días martes",
    descuento: "50% OFF",
    tipo: "2x1",
    valor: 50,
    imagen: "/tacos-mexicanos-promocion.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-01"),
    fecha_fin: new Date("2024-12-31"),
    usos: 156,
    limite_usos: 1000,
    productos_aplicables: ["Tacos al Pastor", "Tacos de Carnitas", "Tacos de Pollo"],
    condiciones: "Válido solo los martes. No acumulable con otras promociones.",
    codigo: "MARTES2X1",
    fecha_creacion: new Date("2024-01-01"),
  },
  {
    id: 2,
    titulo: "Combo Familiar",
    descripcion: "Combo para 4 personas con descuento especial",
    descuento: "25% OFF",
    tipo: "combo",
    valor: 25,
    imagen: "/comida-mexicana-familiar.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-15"),
    fecha_fin: new Date("2024-06-30"),
    usos: 89,
    limite_usos: 500,
    productos_aplicables: ["Pozole", "Enchiladas", "Quesadillas", "Bebidas"],
    condiciones: "Incluye 4 platos principales y 4 bebidas. Mínimo 4 personas.",
    codigo: "FAMILIA25",
    fecha_creacion: new Date("2024-01-15"),
  },
  {
    id: 3,
    titulo: "Happy Hour",
    descripcion: "Descuento en bebidas de 5-7 PM",
    descuento: "$20 OFF",
    tipo: "monto_fijo",
    valor: 20,
    imagen: "/bebidas-mexicanas-happy-hour.jpg",
    activa: true,
    fecha_inicio: new Date("2024-02-01"),
    fecha_fin: new Date("2024-05-31"),
    usos: 234,
    productos_aplicables: ["Cerveza Corona", "Agua de Horchata", "Margaritas"],
    condiciones: "Válido de lunes a viernes de 5:00 PM a 7:00 PM",
    codigo: "HAPPY20",
    fecha_creacion: new Date("2024-02-01"),
  },
  {
    id: 4,
    titulo: "Estudiantes",
    descripcion: "Descuento especial para estudiantes",
    descuento: "15% OFF",
    tipo: "porcentaje",
    valor: 15,
    imagen: "/estudiantes-comida-descuento.jpg",
    activa: false,
    fecha_inicio: new Date("2024-03-01"),
    fecha_fin: new Date("2024-07-31"),
    usos: 45,
    limite_usos: 200,
    productos_aplicables: ["Todos los productos"],
    condiciones: "Presentar credencial de estudiante vigente. No válido fines de semana.",
    codigo: "STUDENT15",
    fecha_creacion: new Date("2024-03-01"),
  },
  {
    id: 5,
    titulo: "Postre Gratis",
    descripcion: "Postre gratis con consumo mínimo",
    descuento: "Gratis",
    tipo: "combo",
    valor: 100,
    imagen: "/postres-mexicanos-flan.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-10"),
    fecha_fin: new Date("2024-04-30"),
    usos: 78,
    limite_usos: 300,
    productos_aplicables: ["Flan Napolitano", "Tres Leches"],
    condiciones: "Con consumo mínimo de $300. Un postre por mesa.",
    codigo: "POSTRE300",
    fecha_creacion: new Date("2024-01-10"),
  },
  {
    id: 6,
    titulo: "Fin de Semana",
    descripcion: "Descuento especial sábados y domingos",
    descuento: "10% OFF",
    tipo: "porcentaje",
    valor: 10,
    imagen: "/weekend-mexican-food.jpg",
    activa: false,
    fecha_inicio: new Date("2024-02-15"),
    fecha_fin: new Date("2024-08-15"),
    usos: 123,
    productos_aplicables: ["Todos los productos"],
    condiciones: "Válido solo sábados y domingos. Toda la carta incluida.",
    codigo: "WEEKEND10",
    fecha_creacion: new Date("2024-02-15"),
  },
]

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>(promocionesData)
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todas")
  const [modalAbierto, setModalAbierto] = useState(false)
  const [promocionEditando, setPromocionEditando] = useState<Promocion | null>(null)

  const promocionesFiltradas = promociones.filter((promocion) => {
    const coincideBusqueda =
      promocion.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      promocion.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      promocion.codigo?.toLowerCase().includes(busqueda.toLowerCase())

    const coincideEstado =
      filtroEstado === "todas" ||
      (filtroEstado === "activas" && promocion.activa) ||
      (filtroEstado === "inactivas" && !promocion.activa)

    return coincideBusqueda && coincideEstado
  })

  const estadisticas = {
    total: promociones.length,
    activas: promociones.filter((p) => p.activa).length,
    inactivas: promociones.filter((p) => !p.activa).length,
    totalUsos: promociones.reduce((sum, p) => sum + p.usos, 0),
  }

  const toggleEstado = (id: number) => {
    setPromociones(promociones.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p)))
  }

  const duplicarPromocion = (promocion: Promocion) => {
    const nuevaPromocion = {
      ...promocion,
      id: Math.max(...promociones.map((p) => p.id)) + 1,
      titulo: `${promocion.titulo} (Copia)`,
      usos: 0,
      fecha_creacion: new Date(),
    }
    setPromociones([...promociones, nuevaPromocion])
  }

  const eliminarPromocion = (id: number) => {
    setPromociones(promociones.filter((p) => p.id !== id))
  }

  const abrirModalNueva = () => {
    setPromocionEditando(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (promocion: Promocion) => {
    setPromocionEditando(promocion)
    setModalAbierto(true)
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "porcentaje":
        return "bg-blue-100 text-blue-800"
      case "monto_fijo":
        return "bg-green-100 text-green-800"
      case "2x1":
        return "bg-purple-100 text-purple-800"
      case "combo":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Promociones</h1>
          <p className="text-gray-600 mt-1">Administra ofertas y descuentos especiales</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={abrirModalNueva} className="gradient-wine text-white gap-2">
            <Plus className="h-4 w-4" />
            Nueva Promoción
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Promociones</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Activas</p>
                <p className="text-3xl font-bold text-green-900">{estadisticas.activas}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 shadow-lg border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Inactivas</p>
                <p className="text-3xl font-bold text-red-900">{estadisticas.inactivas}</p>
              </div>
              <EyeOff className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Total Usos</p>
                <p className="text-3xl font-bold text-purple-900">{estadisticas.totalUsos}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar promociones..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { key: "todas", label: "Todas", count: estadisticas.total },
                { key: "activas", label: "Activas", count: estadisticas.activas },
                { key: "inactivas", label: "Inactivas", count: estadisticas.inactivas },
              ].map((filtro) => (
                <Button
                  key={filtro.key}
                  variant={filtroEstado === filtro.key ? "default" : "outline"}
                  onClick={() => setFiltroEstado(filtro.key)}
                  className={`gap-2 ${filtroEstado === filtro.key ? "gradient-wine text-white" : "hover:bg-gray-50"}`}
                >
                  {filtro.label}
                  <Badge variant="secondary" className="ml-1">
                    {filtro.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Promociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promocionesFiltradas.map((promocion) => (
          <Card
            key={promocion.id}
            className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="relative h-48">
              <img
                src={promocion.imagen || "/placeholder.svg"}
                alt={promocion.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <Badge
                  className={`${
                    promocion.activa
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-400 text-white hover:bg-gray-500"
                  }`}
                >
                  {promocion.activa ? "ACTIVA" : "INACTIVA"}
                </Badge>
              </div>
              <div className="absolute top-4 left-4">
                <Badge className={getTipoColor(promocion.tipo)}>{promocion.tipo.replace("_", " ").toUpperCase()}</Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{promocion.titulo}</h3>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-red-600">{promocion.descuento}</span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{promocion.usos} usos</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promocion.descripcion}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarIcon className="h-3 w-3" />
                  <span>
                    {format(promocion.fecha_inicio, "dd MMM", { locale: es })} -{" "}
                    {format(promocion.fecha_fin, "dd MMM yyyy", { locale: es })}
                  </span>
                </div>
                {promocion.codigo && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Tag className="h-3 w-3" />
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{promocion.codigo}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => abrirModalEditar(promocion)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleEstado(promocion.id)}
                  className={`flex-1 ${
                    promocion.activa
                      ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                      : "text-green-600 hover:text-green-700 hover:bg-green-50"
                  }`}
                >
                  {promocion.activa ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Activar
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => duplicarPromocion(promocion)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Duplicar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarPromocion(promocion.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Promoción */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{promocionEditando ? "Editar Promoción" : "Nueva Promoción"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

              <div>
                <Label htmlFor="titulo">Título de la promoción</Label>
                <Input id="titulo" placeholder="Ej: Martes de Tacos" defaultValue={promocionEditando?.titulo} />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe la promoción..."
                  defaultValue={promocionEditando?.descripcion}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="codigo">Código promocional (opcional)</Label>
                <Input id="codigo" placeholder="Ej: MARTES2X1" defaultValue={promocionEditando?.codigo} />
              </div>
            </div>

            {/* Tipo y Descuento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Tipo y Descuento</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de promoción</Label>
                  <Select defaultValue={promocionEditando?.tipo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentaje">Porcentaje</SelectItem>
                      <SelectItem value="monto_fijo">Monto fijo</SelectItem>
                      <SelectItem value="2x1">2x1</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor del descuento</Label>
                  <Input id="valor" type="number" placeholder="0" defaultValue={promocionEditando?.valor} />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Vigencia</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {promocionEditando?.fecha_inicio
                          ? format(promocionEditando.fecha_inicio, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={promocionEditando?.fecha_inicio} locale={es} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Fecha de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {promocionEditando?.fecha_fin
                          ? format(promocionEditando.fecha_fin, "dd/MM/yyyy", { locale: es })
                          : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={promocionEditando?.fecha_fin} locale={es} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Condiciones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Condiciones</h3>

              <div>
                <Label htmlFor="condiciones">Términos y condiciones</Label>
                <Textarea
                  id="condiciones"
                  placeholder="Especifica las condiciones de la promoción..."
                  defaultValue={promocionEditando?.condiciones}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="limite_usos">Límite de usos (opcional)</Label>
                <Input
                  id="limite_usos"
                  type="number"
                  placeholder="Sin límite"
                  defaultValue={promocionEditando?.limite_usos}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="activa" defaultChecked={promocionEditando?.activa ?? true} />
                <Label htmlFor="activa">Promoción activa</Label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button className="gradient-wine text-white">
                {promocionEditando ? "Actualizar Promoción" : "Crear Promoción"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
