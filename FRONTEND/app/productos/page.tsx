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
}

const categorias = ["Entradas", "Sopas", "Platos Fuertes", "Pizzas", "Bebidas", "Vinos", "Postres"]

const productosData: Producto[] = [
  {
    id: 1,
    nombre: "Tacos al Pastor",
    descripcion: "3 tacos con carne al pastor, piña, cebolla y cilantro",
    precio: 85,
    categoria: "Platos Fuertes",
    imagen: "/tacos-al-pastor-mexicanos.jpg",
    disponible: true,
    tiempo_prep: 15,
    stock: 50,
    costo: 35,
    margen: 58.8,
    ingredientes: ["Carne de cerdo", "Piña", "Tortillas", "Cebolla", "Cilantro"],
    alergenos: ["Gluten"],
    calorias: 420,
    fecha_creacion: "2024-01-15",
  },
  {
    id: 2,
    nombre: "Quesadillas de Flor",
    descripcion: "Quesadillas con flor de calabaza y queso oaxaca",
    precio: 65,
    categoria: "Entradas",
    imagen: "/quesadillas-de-flor-de-calabaza.jpg",
    disponible: true,
    tiempo_prep: 10,
    stock: 30,
    costo: 25,
    margen: 61.5,
    ingredientes: ["Flor de calabaza", "Queso oaxaca", "Tortillas", "Epazote"],
    alergenos: ["Lácteos", "Gluten"],
    calorias: 280,
    fecha_creacion: "2024-01-10",
  },
  {
    id: 3,
    nombre: "Pozole Rojo",
    descripcion: "Pozole tradicional con cerdo, maíz cacahuazintle y chile guajillo",
    precio: 120,
    categoria: "Sopas",
    imagen: "/pozole-rojo-mexicano.jpg",
    disponible: true,
    tiempo_prep: 5,
    stock: 20,
    costo: 45,
    margen: 62.5,
    ingredientes: ["Cerdo", "Maíz cacahuazintle", "Chile guajillo", "Ajo", "Cebolla"],
    alergenos: [],
    calorias: 380,
    fecha_creacion: "2024-01-08",
  },
  {
    id: 4,
    nombre: "Enchiladas Verdes",
    descripcion: "Enchiladas bañadas en salsa verde con pollo y crema",
    precio: 95,
    categoria: "Platos Fuertes",
    imagen: "/enchiladas-verdes-mexicanas.jpg",
    disponible: true,
    tiempo_prep: 20,
    stock: 25,
    costo: 40,
    margen: 57.9,
    ingredientes: ["Pollo", "Tortillas", "Salsa verde", "Crema", "Queso"],
    alergenos: ["Lácteos", "Gluten"],
    calorias: 450,
    fecha_creacion: "2024-01-12",
  },
  {
    id: 5,
    nombre: "Agua de Horchata",
    descripcion: "Agua fresca de horchata con canela",
    precio: 35,
    categoria: "Bebidas",
    imagen: "/agua-de-horchata-mexicana.jpg",
    disponible: true,
    tiempo_prep: 2,
    stock: 100,
    costo: 12,
    margen: 65.7,
    ingredientes: ["Arroz", "Canela", "Azúcar", "Leche condensada"],
    alergenos: ["Lácteos"],
    calorias: 180,
    fecha_creacion: "2024-01-05",
  },
  {
    id: 6,
    nombre: "Flan Napolitano",
    descripcion: "Flan casero con caramelo y vainilla",
    precio: 55,
    categoria: "Postres",
    imagen: "/flan-napolitano-mexicano.jpg",
    disponible: false,
    tiempo_prep: 5,
    stock: 0,
    costo: 20,
    margen: 63.6,
    ingredientes: ["Huevos", "Leche", "Azúcar", "Vainilla"],
    alergenos: ["Huevos", "Lácteos"],
    calorias: 220,
    fecha_creacion: "2024-01-03",
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
          <p className="text-gray-600 mt-1">Administra el menú y catálogo de productos</p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={abrirModalNuevo} className="gradient-wine text-white gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 shadow-lg border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Disponibles</p>
                <p className="text-3xl font-bold text-green-900">{estadisticas.disponibles}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 shadow-lg border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-medium">Agotados</p>
                <p className="text-3xl font-bold text-red-900">{estadisticas.agotados}</p>
              </div>
              <EyeOff className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Valor Inventario</p>
                <p className="text-2xl font-bold text-blue-900">${estadisticas.valorInventario.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría" />
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponible">Disponibles</SelectItem>
                <SelectItem value="agotado">Agotados</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Más filtros
            </Button>
          </div>

          {/* Acciones en lote */}
          {productosSeleccionados.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-blue-700">{productosSeleccionados.length} productos seleccionados</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Cambiar categoría
                  </Button>
                  <Button variant="outline" size="sm">
                    Cambiar disponibilidad
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Productos */}
      <Card className="bg-white shadow-lg border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      productosSeleccionados.length === productosFiltrados.length && productosFiltrados.length > 0
                    }
                    onCheckedChange={seleccionarTodos}
                  />
                </TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Margen</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productosFiltrados.map((producto, index) => (
                <TableRow
                  key={producto.id}
                  className={`hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={productosSeleccionados.includes(producto.id)}
                      onCheckedChange={() => toggleSeleccion(producto.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={producto.imagen || "/placeholder.svg"}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{producto.descripcion}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                      {producto.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900">${producto.precio}</span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-medium ${
                        producto.stock > 10 ? "text-green-600" : producto.stock > 0 ? "text-yellow-600" : "text-red-600"
                      }`}
                    >
                      {producto.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-green-600 font-medium">{producto.margen.toFixed(1)}%</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={producto.disponible}
                        onCheckedChange={() => toggleDisponibilidad(producto.id)}
                        size="sm"
                      />
                      <span
                        className={`text-xs font-medium ${producto.disponible ? "text-green-600" : "text-red-600"}`}
                      >
                        {producto.disponible ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
              <Button variant="outline" onClick={() => setModalAbierto(false)}>
                Cancelar
              </Button>
              <Button className="gradient-wine text-white">
                {productoEditando ? "Actualizar Producto" : "Crear Producto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
