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
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Package,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  Upload,
  Star,
  Flame,
  Leaf,
  ChefHat,
  Award,
} from "lucide-react"

interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  imagen: string
  disponible: boolean
  tiempo_prep: number
  stock: number
  costo: number
  margen: number
  ingredientes: string[]
  alergenos: string[]
  calorias?: number
  fecha_creacion: string
  popular?: boolean
  picante?: boolean
  vegetariano?: boolean
  especialidad?: boolean
}

const categorias = [
  "Entradas",
  "Sopas y Cremas",
  "Platos Fuertes",
  "Mariscos",
  "Carnes",
  "Pizzas",
  "Bebidas",
  "Vinos y Licores",
  "Postres",
  "Café y Té",
]

const productosData: Producto[] = [
  {
    id: 1,
    nombre: "Guacamole Tradicional",
    descripcion:
      "Aguacate fresco machacado con jitomate, cebolla, chile serrano, cilantro y limón. Servido con totopos artesanales.",
    precio: 120,
    categoria: "Entradas",
    imagen: "/guacamole-tradicional-mexicano-con-totopos.jpg",
    disponible: true,
    tiempo_prep: 8,
    stock: 45,
    costo: 45,
    margen: 62.5,
    ingredientes: ["Aguacate hass", "Jitomate", "Cebolla blanca", "Chile serrano", "Cilantro", "Limón", "Sal de grano"],
    alergenos: [],
    calorias: 280,
    fecha_creacion: "2024-01-15",
    popular: true,
    vegetariano: true,
  },
  {
    id: 2,
    nombre: "Tacos al Pastor Especiales",
    descripcion:
      "Carne de cerdo marinada con achiote y especias, asada en trompo. Servidos con piña, cebolla, cilantro y salsa verde.",
    precio: 95,
    categoria: "Platos Fuertes",
    imagen: "/tacos-al-pastor-mexicanos-con-pi-a.jpg",
    disponible: true,
    tiempo_prep: 12,
    stock: 60,
    costo: 38,
    margen: 60.0,
    ingredientes: [
      "Carne de cerdo",
      "Achiote",
      "Piña natural",
      "Tortillas de maíz",
      "Cebolla",
      "Cilantro",
      "Salsa verde",
    ],
    alergenos: ["Gluten"],
    calorias: 420,
    fecha_creacion: "2024-01-10",
    popular: true,
    especialidad: true,
  },
  {
    id: 3,
    nombre: "Pozole Rojo Guerrerense",
    descripcion:
      "Caldo tradicional con maíz cacahuazintle, carne de cerdo y chile guajillo. Acompañado de lechuga, rábano, orégano y limón.",
    precio: 145,
    categoria: "Sopas y Cremas",
    imagen: "/pozole-rojo-mexicano-tradicional.jpg",
    disponible: true,
    tiempo_prep: 5,
    stock: 25,
    costo: 55,
    margen: 62.1,
    ingredientes: [
      "Maíz cacahuazintle",
      "Carne de cerdo",
      "Chile guajillo",
      "Chile ancho",
      "Ajo",
      "Cebolla",
      "Orégano",
    ],
    alergenos: [],
    calorias: 380,
    fecha_creacion: "2024-01-08",
    popular: true,
    especialidad: true,
  },
  {
    id: 4,
    nombre: "Enchiladas Verdes de Pollo",
    descripcion:
      "Tortillas rellenas de pollo deshebrado, bañadas en salsa verde de tomatillo. Con crema, queso fresco y cebolla.",
    precio: 110,
    categoria: "Platos Fuertes",
    imagen: "/enchiladas-verdes-mexicanas-con-pollo.jpg",
    disponible: true,
    tiempo_prep: 18,
    stock: 35,
    costo: 42,
    margen: 61.8,
    ingredientes: ["Pollo", "Tortillas de maíz", "Tomatillo", "Chile serrano", "Crema", "Queso fresco", "Cebolla"],
    alergenos: ["Lácteos", "Gluten"],
    calorias: 450,
    fecha_creacion: "2024-01-12",
  },
  {
    id: 5,
    nombre: "Camarones a la Diabla",
    descripcion:
      "Camarones jumbo salteados en salsa picante de chiles chipotle y guajillo. Acompañados de arroz blanco.",
    precio: 220,
    categoria: "Mariscos",
    imagen: "/camarones-a-la-diabla-mexicanos-picantes.jpg",
    disponible: true,
    tiempo_prep: 15,
    stock: 20,
    costo: 85,
    margen: 61.4,
    ingredientes: ["Camarones jumbo", "Chile chipotle", "Chile guajillo", "Ajo", "Cebolla", "Jitomate", "Arroz"],
    alergenos: ["Mariscos"],
    calorias: 320,
    fecha_creacion: "2024-01-14",
    picante: true,
    especialidad: true,
  },
  {
    id: 6,
    nombre: "Arrachera a la Parrilla",
    descripcion:
      "Corte de arrachera marinado 24 horas, asado a la parrilla. Servido con guacamole, frijoles charros y tortillas.",
    precio: 280,
    categoria: "Carnes",
    imagen: "/arrachera-a-la-parrilla-mexicana.jpg",
    disponible: true,
    tiempo_prep: 20,
    stock: 15,
    costo: 120,
    margen: 57.1,
    ingredientes: ["Arrachera", "Marinada especial", "Guacamole", "Frijoles", "Tortillas de harina", "Pico de gallo"],
    alergenos: ["Gluten"],
    calorias: 580,
    fecha_creacion: "2024-01-16",
    especialidad: true,
  },
  {
    id: 7,
    nombre: "Agua de Horchata Artesanal",
    descripcion: "Bebida tradicional de arroz con canela, vainilla y leche condensada. Preparada diariamente en casa.",
    precio: 45,
    categoria: "Bebidas",
    imagen: "/agua-de-horchata-mexicana-artesanal.jpg",
    disponible: true,
    tiempo_prep: 3,
    stock: 80,
    costo: 15,
    margen: 66.7,
    ingredientes: ["Arroz", "Canela", "Vainilla", "Leche condensada", "Azúcar", "Hielo"],
    alergenos: ["Lácteos"],
    calorias: 180,
    fecha_creacion: "2024-01-05",
    popular: true,
  },
  {
    id: 8,
    nombre: "Flan Napolitano Casero",
    descripcion: "Postre tradicional de huevo y leche con caramelo quemado. Receta familiar de tres generaciones.",
    precio: 65,
    categoria: "Postres",
    imagen: "/flan-napolitano-mexicano-casero.jpg",
    disponible: true,
    tiempo_prep: 5,
    stock: 12,
    costo: 22,
    margen: 66.2,
    ingredientes: ["Huevos", "Leche entera", "Azúcar", "Vainilla", "Caramelo"],
    alergenos: ["Huevos", "Lácteos"],
    calorias: 220,
    fecha_creacion: "2024-01-03",
    especialidad: true,
  },
  {
    id: 9,
    nombre: "Quesadillas de Flor de Calabaza",
    descripcion:
      "Tortillas de maíz rellenas de flor de calabaza fresca, queso oaxaca y epazote. Servidas con salsa verde.",
    precio: 85,
    categoria: "Entradas",
    imagen: "/quesadillas-de-flor-de-calabaza-mexicanas.jpg",
    disponible: true,
    tiempo_prep: 12,
    stock: 30,
    costo: 32,
    margen: 62.4,
    ingredientes: ["Flor de calabaza", "Queso oaxaca", "Tortillas de maíz", "Epazote", "Salsa verde"],
    alergenos: ["Lácteos", "Gluten"],
    calorias: 280,
    fecha_creacion: "2024-01-10",
    vegetariano: true,
  },
  {
    id: 10,
    nombre: "Mole Poblano Tradicional",
    descripcion: "Pollo en salsa de mole poblano con más de 20 ingredientes. Acompañado de arroz rojo y tortillas.",
    precio: 165,
    categoria: "Platos Fuertes",
    imagen: "/mole-poblano-tradicional-mexicano.jpg",
    disponible: true,
    tiempo_prep: 25,
    stock: 18,
    costo: 65,
    margen: 60.6,
    ingredientes: [
      "Pollo",
      "Chiles mulato",
      "Chile ancho",
      "Chile pasilla",
      "Chocolate",
      "Almendras",
      "Ajonjolí",
      "Especias",
    ],
    alergenos: ["Frutos secos"],
    calorias: 520,
    fecha_creacion: "2024-01-18",
    especialidad: true,
  },
  {
    id: 11,
    nombre: "Mezcal Artesanal Oaxaqueño",
    descripcion: "Mezcal 100% agave espadín, destilado artesanalmente en Oaxaca. Servido con sal de gusano y naranja.",
    precio: 180,
    categoria: "Vinos y Licores",
    imagen: "/mezcal-artesanal-oaxaque-o-con-sal-de-gusano.jpg",
    disponible: true,
    tiempo_prep: 2,
    stock: 25,
    costo: 75,
    margen: 58.3,
    ingredientes: ["Mezcal espadín", "Sal de gusano", "Naranja", "Limón"],
    alergenos: [],
    calorias: 70,
    fecha_creacion: "2024-01-20",
    especialidad: true,
  },
  {
    id: 12,
    nombre: "Café de Olla Tradicional",
    descripcion: "Café de grano tostado cocido en olla de barro con canela y piloncillo. Servido en jarrito de barro.",
    precio: 35,
    categoria: "Café y Té",
    imagen: "/caf--de-olla-mexicano-tradicional.jpg",
    disponible: true,
    tiempo_prep: 5,
    stock: 50,
    costo: 12,
    margen: 65.7,
    ingredientes: ["Café de grano", "Canela", "Piloncillo", "Agua"],
    alergenos: [],
    calorias: 25,
    fecha_creacion: "2024-01-22",
    popular: true,
  },
]

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>(productosData)
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("todos")
  const [productosSeleccionados, setProductosSeleccionados] = useState<number[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null)
  const [vistaGrid, setVistaGrid] = useState(false)

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda =
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.toLowerCase())

    const coincideCategoria = filtroCategoria === "todas" || producto.categoria === filtroCategoria

    const coincideDisponibilidad =
      filtroDisponibilidad === "todos" ||
      (filtroDisponibilidad === "disponible" && producto.disponible) ||
      (filtroDisponibilidad === "agotado" && !producto.disponible)

    return coincideBusqueda && coincideCategoria && coincideDisponibilidad
  })

  const estadisticas = {
    total: productos.length,
    disponibles: productos.filter((p) => p.disponible).length,
    agotados: productos.filter((p) => !p.disponible).length,
    valorInventario: productos.reduce((sum, p) => sum + p.precio * p.stock, 0),
    populares: productos.filter((p) => p.popular).length,
    especialidades: productos.filter((p) => p.especialidad).length,
  }

  const toggleSeleccion = (id: number) => {
    setProductosSeleccionados((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]))
  }

  const seleccionarTodos = () => {
    if (productosSeleccionados.length === productosFiltrados.length) {
      setProductosSeleccionados([])
    } else {
      setProductosSeleccionados(productosFiltrados.map((p) => p.id))
    }
  }

  const abrirModalNuevo = () => {
    setProductoEditando(null)
    setModalAbierto(true)
  }

  const abrirModalEditar = (producto: Producto) => {
    setProductoEditando(producto)
    setModalAbierto(true)
  }

  const duplicarProducto = (producto: Producto) => {
    const nuevoProducto = {
      ...producto,
      id: Math.max(...productos.map((p) => p.id)) + 1,
      nombre: `${producto.nombre} (Copia)`,
    }
    setProductos([...productos, nuevoProducto])
  }

  const eliminarProducto = (id: number) => {
    setProductos(productos.filter((p) => p.id !== id))
  }

  const toggleDisponibilidad = (id: number) => {
    setProductos(productos.map((p) => (p.id === id ? { ...p, disponible: !p.disponible } : p)))
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menú del Restaurante</h1>
            <p className="text-gray-600 mt-1">Gestiona los platillos y bebidas de Kantares</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setVistaGrid(!vistaGrid)}
              className="gap-2 bg-transparent transition-smooth hover:scale-105"
            >
              <Package className="h-4 w-4" />
              {vistaGrid ? "Vista Tabla" : "Vista Grid"}
            </Button>
            <Button
              onClick={abrirModalNuevo}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2 transition-smooth hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Nuevo Platillo
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Total Platillos",
            value: estadisticas.total,
            icon: Package,
            color: "text-gray-600",
            bg: "bg-white border-gray-200",
          },
          {
            title: "Disponibles",
            value: estadisticas.disponibles,
            icon: Eye,
            color: "text-green-600",
            bg: "bg-green-50 border-green-200",
          },
          {
            title: "Agotados",
            value: estadisticas.agotados,
            icon: EyeOff,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            title: "Populares",
            value: estadisticas.populares,
            icon: Star,
            color: "text-yellow-600",
            bg: "bg-yellow-50 border-yellow-200",
          },
          {
            title: "Especialidades",
            value: estadisticas.especialidades,
            icon: Award,
            color: "text-purple-600",
            bg: "bg-purple-50 border-purple-200",
          },
          {
            title: "Valor Total",
            value: `$${estadisticas.valorInventario.toLocaleString()}`,
            icon: DollarSign,
            color: "text-blue-600",
            bg: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card
              className={`shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${stat.bg}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${stat.color.replace("-600", "-700")}`}>{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color.replace("-600", "-900")}`}>{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bg.replace("bg-", "bg-").replace("-50", "-100")}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        ))}
      </div>

      {/* Enhanced Filters */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar platillos, ingredientes o categorías..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                />
              </div>
            </div>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-56 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroDisponibilidad} onValueChange={setFiltroDisponibilidad}>
              <SelectTrigger className="w-48 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponible">Disponibles</SelectItem>
                <SelectItem value="agotado">Agotados</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all">
              <Filter className="h-4 w-4" />
              Más filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {vistaGrid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto, index) => (
            <SlideIn key={producto.id} direction="up" delay={0.1 + index * 0.05}>
              <Card className="group bg-white shadow-lg border-0 transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={producto.imagen || "/placeholder.svg"}
                      alt={producto.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {producto.popular && (
                      <Badge className="bg-yellow-500 text-white shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {producto.especialidad && (
                      <Badge className="bg-purple-500 text-white shadow-lg">
                        <Award className="h-3 w-3 mr-1" />
                        Especialidad
                      </Badge>
                    )}
                    {producto.picante && (
                      <Badge className="bg-red-500 text-white shadow-lg">
                        <Flame className="h-3 w-3 mr-1" />
                        Picante
                      </Badge>
                    )}
                    {producto.vegetariano && (
                      <Badge className="bg-green-500 text-white shadow-lg">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegetariano
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-gray-900 shadow-lg text-lg font-bold">${producto.precio}</Badge>
                  </div>

                  {/* Status */}
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      variant={producto.disponible ? "default" : "secondary"}
                      className={producto.disponible ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                    >
                      {producto.disponible ? "Disponible" : "Agotado"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
                        {producto.nombre}
                      </h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {producto.categoria}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{producto.descripcion}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {producto.tiempo_prep} min
                      </div>
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-4 w-4" />
                        Stock: {producto.stock}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                        onClick={() => abrirModalEditar(producto)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="px-3 bg-transparent">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => duplicarProducto(producto)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => toggleDisponibilidad(producto.id)}
                            className={producto.disponible ? "text-red-600" : "text-green-600"}
                          >
                            {producto.disponible ? (
                              <EyeOff className="h-4 w-4 mr-2" />
                            ) : (
                              <Eye className="h-4 w-4 mr-2" />
                            )}
                            {producto.disponible ? "Desactivar" : "Activar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => eliminarProducto(producto.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>
      ) : (
        // Table View (existing table code with minor enhancements)
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        productosSeleccionados.length === productosFiltrados.length && productosFiltrados.length > 0
                      }
                      onCheckedChange={seleccionarTodos}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Producto</TableHead>
                  <TableHead className="font-semibold">Categoría</TableHead>
                  <TableHead className="font-semibold">Precio</TableHead>
                  <TableHead className="font-semibold">Stock</TableHead>
                  <TableHead className="font-semibold">Margen</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productosFiltrados.map((producto, index) => (
                  <TableRow key={producto.id} className="hover:bg-gray-50 transition-all duration-200 group">
                    <TableCell>
                      <Checkbox
                        checked={productosSeleccionados.includes(producto.id)}
                        onCheckedChange={() => toggleSeleccion(producto.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                          <img
                            src={producto.imagen || "/placeholder.svg"}
                            alt={producto.nombre}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{producto.nombre}</p>
                            <div className="flex gap-1">
                              {producto.popular && <Star className="h-4 w-4 text-yellow-500" />}
                              {producto.especialidad && <Award className="h-4 w-4 text-purple-500" />}
                              {producto.picante && <Flame className="h-4 w-4 text-red-500" />}
                              {producto.vegetariano && <Leaf className="h-4 w-4 text-green-500" />}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1 max-w-md">{producto.descripcion}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {producto.tiempo_prep} min
                            {producto.calorias && (
                              <>
                                <span>•</span>
                                <span>{producto.calorias} cal</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                        {producto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-lg text-gray-900">${producto.precio}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          producto.stock > 20
                            ? "text-green-600"
                            : producto.stock > 5
                              ? "text-yellow-600"
                              : producto.stock > 0
                                ? "text-orange-600"
                                : "text-red-600"
                        }`}
                      >
                        {producto.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-green-600 font-semibold">{producto.margen.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={producto.disponible}
                          onCheckedChange={() => toggleDisponibilidad(producto.id)}
                          size="sm"
                        />
                        <Badge
                          variant={producto.disponible ? "default" : "secondary"}
                          className={`text-xs ${
                            producto.disponible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {producto.disponible ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => abrirModalEditar(producto)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicarProducto(producto)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => eliminarProducto(producto.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Modal de Producto */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productoEditando ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre del producto</Label>
                  <Input id="nombre" placeholder="Ej: Tacos al Pastor" defaultValue={productoEditando?.nombre} />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select defaultValue={productoEditando?.categoria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el producto..."
                  defaultValue={productoEditando?.descripcion}
                  rows={3}
                />
              </div>

              {/* Upload de imagen */}
              <div>
                <Label>Imagen del producto</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Arrastra una imagen aquí o{" "}
                    <button className="text-red-600 hover:text-red-700 font-medium">selecciona un archivo</button>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG hasta 5MB</p>
                </div>
              </div>
            </div>

            {/* Precios y Costos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Precios y Costos</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio">Precio de venta</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="precio"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      defaultValue={productoEditando?.precio}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="costo">Costo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      id="costo"
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      defaultValue={productoEditando?.costo}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="margen">Margen (%)</Label>
                  <Input
                    id="margen"
                    type="number"
                    placeholder="0"
                    defaultValue={productoEditando?.margen}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Inventario y Preparación */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Inventario y Preparación</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock inicial</Label>
                  <Input id="stock" type="number" placeholder="0" defaultValue={productoEditando?.stock} />
                </div>
                <div>
                  <Label htmlFor="tiempo_prep">Tiempo de preparación (min)</Label>
                  <div className="relative">
                    <Input
                      id="tiempo_prep"
                      type="number"
                      placeholder="0"
                      defaultValue={productoEditando?.tiempo_prep}
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="disponible" defaultChecked={productoEditando?.disponible ?? true} />
                <Label htmlFor="disponible">Producto disponible para venta</Label>
              </div>
            </div>

            {/* Ingredientes y Alérgenos */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Ingredientes y Alérgenos</h3>

              <div>
                <Label htmlFor="ingredientes">Ingredientes</Label>
                <Textarea
                  id="ingredientes"
                  placeholder="Lista los ingredientes separados por comas..."
                  defaultValue={productoEditando?.ingredientes.join(", ")}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="alergenos">Alérgenos</Label>
                <Textarea
                  id="alergenos"
                  placeholder="Lista los alérgenos separados por comas..."
                  defaultValue={productoEditando?.alergenos.join(", ")}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="calorias">Calorías (opcional)</Label>
                <Input id="calorias" type="number" placeholder="0" defaultValue={productoEditando?.calorias} />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setModalAbierto(false)}
                className="transition-smooth hover:scale-105"
              >
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-smooth hover:scale-105">
                {productoEditando ? "Actualizar Producto" : "Crear Producto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
