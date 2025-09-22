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
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  CalendarIcon,
  Tag,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
  Copy,
  Percent,
  DollarSign,
  Gift,
  Sparkles,
  Clock,
  Target,
  Zap,
  Star,
} from "lucide-react"
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
  popular?: boolean
  urgente?: boolean
  nuevo?: boolean
}

const promocionesData: Promocion[] = [
  {
    id: 1,
    titulo: "Martes de Tacos al Pastor",
    descripcion:
      "¡2x1 en nuestros famosos tacos al pastor! Carne marinada con achiote, piña fresca y tortillas artesanales.",
    descuento: "2x1",
    tipo: "2x1",
    valor: 50,
    imagen: "/tacos-al-pastor-mexicanos-promocion.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-01"),
    fecha_fin: new Date("2024-12-31"),
    usos: 342,
    limite_usos: 1000,
    productos_aplicables: ["Tacos al Pastor", "Tacos de Carnitas", "Tacos de Pollo"],
    condiciones:
      "Válido solo los martes de 12:00 PM a 10:00 PM. No acumulable con otras promociones. Máximo 6 tacos por persona.",
    codigo: "MARTES2X1",
    fecha_creacion: new Date("2024-01-01"),
    popular: true,
  },
  {
    id: 2,
    titulo: "Combo Familiar Kantares",
    descripcion: "Perfecto para compartir en familia: 4 platos principales, 4 bebidas y postre de cortesía.",
    descuento: "25% OFF",
    tipo: "combo",
    valor: 25,
    imagen: "/comida-mexicana-familiar-mesa.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-15"),
    fecha_fin: new Date("2024-06-30"),
    usos: 156,
    limite_usos: 500,
    productos_aplicables: ["Pozole Rojo", "Enchiladas Verdes", "Mole Poblano", "Quesadillas", "Bebidas", "Postres"],
    condiciones: "Incluye 4 platos principales, 4 bebidas y 1 postre. Mínimo 4 personas. Válido todos los días.",
    codigo: "FAMILIA25",
    fecha_creacion: new Date("2024-01-15"),
    nuevo: true,
  },
  {
    id: 3,
    titulo: "Happy Hour Cantina",
    descripcion: "¡La hora más feliz del día! Descuento especial en todas nuestras bebidas tradicionales.",
    descuento: "$30 OFF",
    tipo: "monto_fijo",
    valor: 30,
    imagen: "/bebidas-mexicanas-horchata-margaritas.jpg",
    activa: true,
    fecha_inicio: new Date("2024-02-01"),
    fecha_fin: new Date("2024-05-31"),
    usos: 289,
    productos_aplicables: ["Agua de Horchata", "Agua de Jamaica", "Margaritas", "Cerveza Corona", "Mezcal"],
    condiciones: "Válido de lunes a viernes de 5:00 PM a 7:00 PM. Aplica en bebidas seleccionadas.",
    codigo: "HAPPY30",
    fecha_creacion: new Date("2024-02-01"),
    popular: true,
  },
  {
    id: 4,
    titulo: "Descuento Estudiantes",
    descripcion: "Apoyamos a nuestros estudiantes con un descuento especial en toda la carta.",
    descuento: "20% OFF",
    tipo: "porcentaje",
    valor: 20,
    imagen: "/estudiantes-jovenes-comida-mexicana.jpg",
    activa: true,
    fecha_inicio: new Date("2024-03-01"),
    fecha_fin: new Date("2024-07-31"),
    usos: 78,
    limite_usos: 200,
    productos_aplicables: ["Todos los productos"],
    condiciones:
      "Presentar credencial de estudiante vigente. Válido de lunes a jueves. No aplica en bebidas alcohólicas.",
    codigo: "STUDENT20",
    fecha_creacion: new Date("2024-03-01"),
  },
  {
    id: 5,
    titulo: "Postre de Cortesía",
    descripcion: "¡Endulza tu experiencia! Postre gratis con tu consumo. Elige entre nuestros postres tradicionales.",
    descuento: "GRATIS",
    tipo: "combo",
    valor: 100,
    imagen: "/postres-mexicanos-flan-tres-leches.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-10"),
    fecha_fin: new Date("2024-04-30"),
    usos: 134,
    limite_usos: 300,
    productos_aplicables: ["Flan Napolitano", "Tres Leches", "Churros con Cajeta"],
    condiciones: "Con consumo mínimo de $400. Un postre por mesa. Válido todos los días después de las 6:00 PM.",
    codigo: "POSTRE400",
    fecha_creacion: new Date("2024-01-10"),
    nuevo: true,
  },
  {
    id: 6,
    titulo: "Weekend Especial",
    descripcion: "¡Los fines de semana son para disfrutar! Descuento en toda nuestra carta.",
    descuento: "15% OFF",
    tipo: "porcentaje",
    valor: 15,
    imagen: "/fin-de-semana-comida-mexicana-festivo.jpg",
    activa: false,
    fecha_inicio: new Date("2024-02-15"),
    fecha_fin: new Date("2024-08-15"),
    usos: 201,
    productos_aplicables: ["Todos los productos"],
    condiciones: "Válido sábados y domingos todo el día. Incluye toda la carta y bebidas.",
    codigo: "WEEKEND15",
    fecha_creacion: new Date("2024-02-15"),
  },
  {
    id: 7,
    titulo: "Noche de Mariscos",
    descripcion: "¡Viernes de mariscos frescos! Descuento especial en todos nuestros platillos del mar.",
    descuento: "30% OFF",
    tipo: "porcentaje",
    valor: 30,
    imagen: "/mariscos-mexicanos-camarones-pescado.jpg",
    activa: true,
    fecha_inicio: new Date("2024-03-01"),
    fecha_fin: new Date("2024-06-30"),
    usos: 67,
    limite_usos: 150,
    productos_aplicables: ["Camarones a la Diabla", "Pescado a la Veracruzana", "Ceviche", "Aguachile"],
    condiciones: "Válido solo los viernes. Aplica únicamente en platillos de mariscos. Sujeto a disponibilidad.",
    codigo: "MARISCOS30",
    fecha_creacion: new Date("2024-03-01"),
    urgente: true,
  },
  {
    id: 8,
    titulo: "Cumpleañeros VIP",
    descripcion: "¡Celebra tu cumpleaños con nosotros! Mesa especial y descuento en tu día especial.",
    descuento: "25% OFF",
    tipo: "porcentaje",
    valor: 25,
    imagen: "/cumpleanos-celebracion-mexicana-fiesta.jpg",
    activa: true,
    fecha_inicio: new Date("2024-01-01"),
    fecha_fin: new Date("2024-12-31"),
    usos: 45,
    productos_aplicables: ["Todos los productos", "Pastel de cumpleaños"],
    condiciones:
      "Presentar identificación oficial. Válido el día del cumpleaños y 3 días después. Incluye pastel de cortesía.",
    codigo: "CUMPLE25",
    fecha_creacion: new Date("2024-01-01"),
    popular: true,
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
    populares: promociones.filter((p) => p.popular).length,
    nuevas: promociones.filter((p) => p.nuevo).length,
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
      nuevo: true,
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

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "porcentaje":
        return <Percent className="h-4 w-4" />
      case "monto_fijo":
        return <DollarSign className="h-4 w-4" />
      case "2x1":
        return <Gift className="h-4 w-4" />
      case "combo":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "porcentaje":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "monto_fijo":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white"
      case "2x1":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
      case "combo":
        return "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Enhanced Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Promociones Especiales
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Ofertas irresistibles que enamoran a nuestros clientes</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={abrirModalNueva}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              Nueva Promoción
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Total",
            value: estadisticas.total,
            icon: Tag,
            color: "text-gray-600",
            bg: "bg-white border-gray-200",
          },
          {
            title: "Activas",
            value: estadisticas.activas,
            icon: Zap,
            color: "text-green-600",
            bg: "bg-gradient-to-br from-green-50 to-green-100 border-green-200",
          },
          {
            title: "Inactivas",
            value: estadisticas.inactivas,
            icon: EyeOff,
            color: "text-red-600",
            bg: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
          },
          {
            title: "Populares",
            value: estadisticas.populares,
            icon: Star,
            color: "text-yellow-600",
            bg: "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200",
          },
          {
            title: "Nuevas",
            value: estadisticas.nuevas,
            icon: Sparkles,
            color: "text-purple-600",
            bg: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200",
          },
          {
            title: "Total Usos",
            value: estadisticas.totalUsos.toLocaleString(),
            icon: TrendingUp,
            color: "text-blue-600",
            bg: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card
              className={`${stat.bg} shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${stat.color.replace("-600", "-700")} text-sm font-semibold`}>{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color.replace("-600", "-900")}`}>{stat.value}</p>
                  </div>
                  <div
                    className={`p-2 rounded-lg ${stat.bg.replace("bg-", "bg-").replace("-50", "-200").replace("border-", "bg-").replace("-200", "-100")}`}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Enhanced Filters */}
      <SlideIn direction="up" delay={0.5}>
        <Card className="bg-white shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Buscar promociones, códigos o descripciones..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-12 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all text-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                {[
                  { key: "todas", label: "Todas", count: estadisticas.total, color: "bg-gray-100 text-gray-800" },
                  {
                    key: "activas",
                    label: "Activas",
                    count: estadisticas.activas,
                    color: "bg-green-100 text-green-800",
                  },
                  {
                    key: "inactivas",
                    label: "Inactivas",
                    count: estadisticas.inactivas,
                    color: "bg-red-100 text-red-800",
                  },
                ].map((filtro) => (
                  <Button
                    key={filtro.key}
                    variant={filtroEstado === filtro.key ? "default" : "outline"}
                    onClick={() => setFiltroEstado(filtro.key)}
                    className={`gap-2 transition-all duration-300 hover:scale-105 ${
                      filtroEstado === filtro.key
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    {filtro.label}
                    <Badge
                      variant="secondary"
                      className={`ml-1 ${filtroEstado === filtro.key ? "bg-white/20 text-white" : filtro.color}`}
                    >
                      {filtro.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </SlideIn>

      {/* Enhanced Grid de Promociones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {promocionesFiltradas.map((promocion, index) => (
          <SlideIn key={promocion.id} direction="up" delay={0.6 + index * 0.1}>
            <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:scale-105 relative">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                {/* Image Section with Overlay */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={promocion.imagen || "/placeholder.svg?height=224&width=400&query=mexican food promotion"}
                    alt={promocion.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Status Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Badge
                      className={`shadow-lg transition-all duration-300 ${
                        promocion.activa
                          ? "bg-green-500 text-white hover:bg-green-600 animate-pulse"
                          : "bg-gray-500 text-white hover:bg-gray-600"
                      }`}
                    >
                      {promocion.activa ? "ACTIVA" : "INACTIVA"}
                    </Badge>

                    {promocion.popular && (
                      <Badge className="bg-yellow-500 text-white shadow-lg animate-bounce">
                        <Star className="h-3 w-3 mr-1" />
                        POPULAR
                      </Badge>
                    )}

                    {promocion.nuevo && (
                      <Badge className="bg-purple-500 text-white shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        NUEVO
                      </Badge>
                    )}

                    {promocion.urgente && (
                      <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
                        <Zap className="h-3 w-3 mr-1" />
                        URGENTE
                      </Badge>
                    )}
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getTipoColor(promocion.tipo)} shadow-lg`}>
                      {getTipoIcon(promocion.tipo)}
                      <span className="ml-1">{promocion.tipo.replace("_", " ").toUpperCase()}</span>
                    </Badge>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">{promocion.titulo}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-yellow-400 drop-shadow-lg">{promocion.descuento}</span>
                      {promocion.codigo && (
                        <Badge className="bg-white/20 text-white backdrop-blur-sm">
                          <Tag className="h-3 w-3 mr-1" />
                          {promocion.codigo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-6 relative">
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{promocion.descripcion}</p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold">{promocion.usos.toLocaleString()}</span>
                        <span>usos</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Target className="h-4 w-4" />
                        <span>
                          {promocion.limite_usos ? `${promocion.limite_usos.toLocaleString()} máx` : "Sin límite"}
                        </span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {format(promocion.fecha_inicio, "dd MMM", { locale: es })} -{" "}
                        {format(promocion.fecha_fin, "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {promocion.limite_usos && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Progreso</span>
                          <span>{Math.round((promocion.usos / promocion.limite_usos) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min((promocion.usos / promocion.limite_usos) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 hover:scale-105 shadow-lg"
                        onClick={() => abrirModalEditar(promocion)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleEstado(promocion.id)}
                        className={`flex-1 transition-all duration-300 hover:scale-105 ${
                          promocion.activa
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                        }`}
                      >
                        {promocion.activa ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicarPromocion(promocion)}
                        className="text-gray-500 hover:text-gray-700 transition-all duration-300 hover:scale-105"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarPromocion(promocion.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-300 hover:scale-105"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Modal de Promoción */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              {promocionEditando ? "Editar Promoción" : "Nueva Promoción"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-red-600" />
                Información Básica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titulo" className="text-sm font-semibold text-gray-700">
                    Título de la promoción
                  </Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Martes de Tacos al Pastor"
                    defaultValue={promocionEditando?.titulo}
                    className="mt-1 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="codigo" className="text-sm font-semibold text-gray-700">
                    Código promocional
                  </Label>
                  <Input
                    id="codigo"
                    placeholder="Ej: MARTES2X1"
                    defaultValue={promocionEditando?.codigo}
                    className="mt-1 h-11 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion" className="text-sm font-semibold text-gray-700">
                  Descripción detallada
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe la promoción de manera atractiva para los clientes..."
                  defaultValue={promocionEditando?.descripcion}
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Tipo y Descuento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Percent className="h-5 w-5 text-red-600" />
                Tipo y Descuento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo" className="text-sm font-semibold text-gray-700">
                    Tipo de promoción
                  </Label>
                  <Select defaultValue={promocionEditando?.tipo}>
                    <SelectTrigger className="mt-1 h-11">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="porcentaje">
                        <div className="flex items-center gap-2">
                          <Percent className="h-4 w-4" />
                          Porcentaje de descuento
                        </div>
                      </SelectItem>
                      <SelectItem value="monto_fijo">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Monto fijo de descuento
                        </div>
                      </SelectItem>
                      <SelectItem value="2x1">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4" />
                          2x1 o promociones especiales
                        </div>
                      </SelectItem>
                      <SelectItem value="combo">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Combo o paquete especial
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor" className="text-sm font-semibold text-gray-700">
                    Valor del descuento
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    placeholder="0"
                    defaultValue={promocionEditando?.valor}
                    className="mt-1 h-11"
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-red-600" />
                Período de Vigencia
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Fecha de inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1 h-11 bg-transparent"
                      >
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
                  <Label className="text-sm font-semibold text-gray-700">Fecha de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1 h-11 bg-transparent"
                      >
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
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Condiciones y Límites
              </h3>

              <div>
                <Label htmlFor="condiciones" className="text-sm font-semibold text-gray-700">
                  Términos y condiciones
                </Label>
                <Textarea
                  id="condiciones"
                  placeholder="Especifica las condiciones, horarios, restricciones y términos de la promoción..."
                  defaultValue={promocionEditando?.condiciones}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="limite_usos" className="text-sm font-semibold text-gray-700">
                  Límite de usos (opcional)
                </Label>
                <Input
                  id="limite_usos"
                  type="number"
                  placeholder="Dejar vacío para sin límite"
                  defaultValue={promocionEditando?.limite_usos}
                  className="mt-1 h-11"
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Switch id="activa" defaultChecked={promocionEditando?.activa ?? true} />
                <Label htmlFor="activa" className="text-sm font-semibold text-gray-700">
                  Promoción activa (visible para clientes)
                </Label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setModalAbierto(false)}
                className="px-6 py-2 transition-all duration-300 hover:scale-105"
              >
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2 transition-all duration-300 hover:scale-105 shadow-lg">
                {promocionEditando ? "Actualizar Promoción" : "Crear Promoción"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
