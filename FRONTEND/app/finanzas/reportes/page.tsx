"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  CalendarIcon,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  Clock,
  Package,
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"

// Datos de ejemplo para los reportes
const ventasMensuales = [
  { mes: "Ene", ventas: 45000, gastos: 28000, utilidad: 17000 },
  { mes: "Feb", ventas: 52000, gastos: 31000, utilidad: 21000 },
  { mes: "Mar", ventas: 48000, gastos: 29000, utilidad: 19000 },
  { mes: "Apr", ventas: 61000, gastos: 35000, utilidad: 26000 },
  { mes: "May", ventas: 55000, gastos: 33000, utilidad: 22000 },
  { mes: "Jun", ventas: 67000, gastos: 38000, utilidad: 29000 },
]

const ventasPorCategoria = [
  { categoria: "Platos Principales", ventas: 125000, porcentaje: 35, color: "#dc2626" },
  { categoria: "Bebidas", ventas: 89000, porcentaje: 25, color: "#f59e0b" },
  { categoria: "Entradas", ventas: 71000, porcentaje: 20, color: "#0891b2" },
  { categoria: "Postres", ventas: 53000, porcentaje: 15, color: "#4b5563" },
  { categoria: "Otros", ventas: 18000, porcentaje: 5, color: "#d97706" },
]

const topProductos = [
  { producto: "Tacos al Pastor", ventas: 2850, ingresos: 85500 },
  { producto: "Pozole Rojo", ventas: 2340, ingresos: 70200 },
  { producto: "Quesadillas", ventas: 2120, ingresos: 63600 },
  { producto: "Enchiladas Verdes", ventas: 1890, ingresos: 56700 },
  { producto: "Agua de Horchata", ventas: 1650, ingresos: 49500 },
]

const ventasPorHora = [
  {
    hora: "08:00",
    lunes: 1200,
    martes: 1100,
    miercoles: 1300,
    jueves: 1250,
    viernes: 1400,
    sabado: 1800,
    domingo: 1600,
  },
  {
    hora: "09:00",
    lunes: 1800,
    martes: 1700,
    miercoles: 1900,
    jueves: 1850,
    viernes: 2100,
    sabado: 2400,
    domingo: 2200,
  },
  {
    hora: "10:00",
    lunes: 2400,
    martes: 2300,
    miercoles: 2500,
    jueves: 2450,
    viernes: 2800,
    sabado: 3200,
    domingo: 2900,
  },
  {
    hora: "11:00",
    lunes: 3200,
    martes: 3100,
    miercoles: 3300,
    jueves: 3250,
    viernes: 3600,
    sabado: 4200,
    domingo: 3800,
  },
  {
    hora: "12:00",
    lunes: 4800,
    martes: 4700,
    miercoles: 4900,
    jueves: 4850,
    viernes: 5400,
    sabado: 6200,
    domingo: 5600,
  },
  {
    hora: "13:00",
    lunes: 6200,
    martes: 6100,
    miercoles: 6300,
    jueves: 6250,
    viernes: 6900,
    sabado: 7800,
    domingo: 7200,
  },
  {
    hora: "14:00",
    lunes: 7800,
    martes: 7700,
    miercoles: 7900,
    jueves: 7850,
    viernes: 8600,
    sabado: 9800,
    domingo: 9000,
  },
  {
    hora: "15:00",
    lunes: 6400,
    martes: 6300,
    miercoles: 6500,
    jueves: 6450,
    viernes: 7100,
    sabado: 8200,
    domingo: 7400,
  },
  {
    hora: "16:00",
    lunes: 4200,
    martes: 4100,
    miercoles: 4300,
    jueves: 4250,
    viernes: 4700,
    sabado: 5400,
    domingo: 4900,
  },
  {
    hora: "17:00",
    lunes: 5600,
    martes: 5500,
    miercoles: 5700,
    jueves: 5650,
    viernes: 6200,
    sabado: 7200,
    domingo: 6500,
  },
  {
    hora: "18:00",
    lunes: 7200,
    martes: 7100,
    miercoles: 7300,
    jueves: 7250,
    viernes: 7900,
    sabado: 9200,
    domingo: 8300,
  },
  {
    hora: "19:00",
    lunes: 8900,
    martes: 8800,
    miercoles: 9000,
    jueves: 8950,
    viernes: 9800,
    sabado: 11200,
    domingo: 10100,
  },
  {
    hora: "20:00",
    lunes: 9600,
    martes: 9500,
    miercoles: 9700,
    jueves: 9650,
    viernes: 10500,
    sabado: 12000,
    domingo: 10800,
  },
  {
    hora: "21:00",
    lunes: 7800,
    martes: 7700,
    miercoles: 7900,
    jueves: 7850,
    viernes: 8600,
    sabado: 9800,
    domingo: 8900,
  },
  {
    hora: "22:00",
    lunes: 4200,
    martes: 4100,
    miercoles: 4300,
    jueves: 4250,
    viernes: 4700,
    sabado: 5400,
    domingo: 4900,
  },
]

export default function ReportesPage() {
  const [fechaInicio, setFechaInicio] = useState<Date>(startOfMonth(new Date()))
  const [fechaFin, setFechaFin] = useState<Date>(endOfMonth(new Date()))
  const [tipoReporte, setTipoReporte] = useState("ventas")
  const [periodo, setPeriodo] = useState("mes")

  const kpis = {
    ventasTotal: 357000,
    cambioVentas: 12.5,
    gastosTotal: 214000,
    cambioGastos: -8.3,
    utilidadTotal: 143000,
    cambioUtilidad: 18.7,
    ordenesTotal: 1847,
    cambioOrdenes: 5.2,
    ticketPromedio: 193,
    cambioTicket: 7.1,
    clientesUnicos: 1234,
    cambioClientes: 15.8,
  }

  const aplicarPeriodo = (nuevoPeriodo: string) => {
    setPeriodo(nuevoPeriodo)
    const hoy = new Date()

    switch (nuevoPeriodo) {
      case "hoy":
        setFechaInicio(hoy)
        setFechaFin(hoy)
        break
      case "semana":
        setFechaInicio(subDays(hoy, 7))
        setFechaFin(hoy)
        break
      case "mes":
        setFechaInicio(startOfMonth(hoy))
        setFechaFin(endOfMonth(hoy))
        break
      case "trimestre":
        setFechaInicio(subDays(hoy, 90))
        setFechaFin(hoy)
        break
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-full">
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Centro de Reportes</h1>
              <p className="text-gray-600 mt-1">Análisis completo de rendimiento y métricas del negocio</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Períodos rápidos */}
              <div className="flex gap-2">
                {[
                  { key: "hoy", label: "Hoy" },
                  { key: "semana", label: "Semana" },
                  { key: "mes", label: "Mes" },
                  { key: "trimestre", label: "Trimestre" },
                ].map((p) => (
                  <Button
                    key={p.key}
                    variant={periodo === p.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => aplicarPeriodo(p.key)}
                    className={`transition-smooth hover:scale-105 ${periodo === p.key ? "gradient-wine text-white" : ""}`}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>

              {/* Controles */}
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent transition-smooth hover:scale-105">
                      <CalendarIcon className="h-4 w-4" />
                      {format(fechaInicio, "dd MMM", { locale: es })} - {format(fechaFin, "dd MMM", { locale: es })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar mode="range" selected={{ from: fechaInicio, to: fechaFin }} locale={es} />
                  </PopoverContent>
                </Popover>

                <Button variant="outline" size="icon" className="transition-smooth hover:scale-105 bg-transparent">
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button variant="outline" className="gap-2 bg-transparent transition-smooth hover:scale-105">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* KPIs Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
          {[
            {
              title: "Ventas Totales",
              value: kpis.ventasTotal,
              change: kpis.cambioVentas,
              icon: TrendingUp,
              prefix: "$",
              color: "bg-green-50 border-green-200 text-green-700",
              iconColor: "text-green-600",
              isPositive: true,
            },
            {
              title: "Gastos Totales",
              value: kpis.gastosTotal,
              change: kpis.cambioGastos,
              icon: TrendingDown,
              prefix: "$",
              color: "bg-red-50 border-red-200 text-red-700",
              iconColor: "text-red-600",
              isPositive: false,
            },
            {
              title: "Utilidad Neta",
              value: kpis.utilidadTotal,
              change: kpis.cambioUtilidad,
              icon: DollarSign,
              prefix: "$",
              color: "bg-blue-50 border-blue-200 text-blue-700",
              iconColor: "text-blue-600",
              isPositive: true,
            },
            {
              title: "Órdenes",
              value: kpis.ordenesTotal,
              change: kpis.cambioOrdenes,
              icon: ShoppingCart,
              prefix: "",
              color: "bg-purple-50 border-purple-200 text-purple-700",
              iconColor: "text-purple-600",
              isPositive: true,
            },
            {
              title: "Ticket Promedio",
              value: kpis.ticketPromedio,
              change: kpis.cambioTicket,
              icon: Target,
              prefix: "$",
              color: "bg-orange-50 border-orange-200 text-orange-700",
              iconColor: "text-orange-600",
              isPositive: true,
            },
            {
              title: "Clientes Únicos",
              value: kpis.clientesUnicos,
              change: kpis.cambioClientes,
              icon: Users,
              prefix: "",
              color: "bg-indigo-50 border-indigo-200 text-indigo-700",
              iconColor: "text-indigo-600",
              isPositive: true,
            },
          ].map((kpi, index) => (
            <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
              <Card className={`${kpi.color} border transition-smooth hover:shadow-lg hover:scale-105`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{kpi.title}</p>
                      <p className="text-2xl font-bold mt-1">
                        {kpi.prefix}
                        {kpi.value.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        {kpi.isPositive ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${kpi.isPositive ? "text-green-600" : "text-red-600"}`}>
                          {Math.abs(kpi.change)}%
                        </span>
                      </div>
                    </div>
                    <kpi.icon className={`w-8 h-8 ${kpi.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* Tabs de reportes */}
        <SlideIn direction="up" delay={0.7}>
          <Tabs defaultValue="ventas" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ventas" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Ventas
              </TabsTrigger>
              <TabsTrigger value="productos" className="gap-2">
                <Package className="w-4 h-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="operaciones" className="gap-2">
                <Activity className="w-4 h-4" />
                Operaciones
              </TabsTrigger>
              <TabsTrigger value="financiero" className="gap-2">
                <DollarSign className="w-4 h-4" />
                Financiero
              </TabsTrigger>
            </TabsList>

            {/* Reporte de Ventas */}
            <TabsContent value="ventas" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Gráfico de ventas mensuales */}
                <SlideIn direction="up" delay={0.8}>
                  <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                    <CardHeader>
                      <CardTitle>Tendencia de Ventas Mensuales</CardTitle>
                      <CardDescription>Comparación de ventas, gastos y utilidad</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={ventasMensuales}>
                          <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorUtilidad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="mes" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                          <Area
                            type="monotone"
                            dataKey="ventas"
                            stroke="#dc2626"
                            fillOpacity={1}
                            fill="url(#colorVentas)"
                          />
                          <Area
                            type="monotone"
                            dataKey="utilidad"
                            stroke="#0891b2"
                            fillOpacity={1}
                            fill="url(#colorUtilidad)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </SlideIn>

                {/* Ventas por categoría */}
                <SlideIn direction="up" delay={0.9}>
                  <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                    <CardHeader>
                      <CardTitle>Ventas por Categoría</CardTitle>
                      <CardDescription>Distribución de ingresos por tipo de producto</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={ventasPorCategoria}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            dataKey="ventas"
                            label={({ categoria, porcentaje }) => `${categoria}: ${porcentaje}%`}
                          >
                            {ventasPorCategoria.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </SlideIn>
              </div>

              {/* Mapa de calor de ventas por hora */}
              <SlideIn direction="up" delay={1.0}>
                <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>Patrón de Ventas por Hora y Día</CardTitle>
                    <CardDescription>Análisis de horarios pico de actividad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={ventasPorHora}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="hora" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                        <Legend />
                        <Line type="monotone" dataKey="lunes" stroke="#dc2626" strokeWidth={2} />
                        <Line type="monotone" dataKey="viernes" stroke="#f59e0b" strokeWidth={2} />
                        <Line type="monotone" dataKey="sabado" stroke="#0891b2" strokeWidth={2} />
                        <Line type="monotone" dataKey="domingo" stroke="#4b5563" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </SlideIn>
            </TabsContent>

            {/* Reporte de Productos */}
            <TabsContent value="productos" className="space-y-6">
              <SlideIn direction="up" delay={0.8}>
                <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>Top 5 Productos Más Vendidos</CardTitle>
                    <CardDescription>Ranking de productos por volumen de ventas e ingresos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topProductos.map((producto, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg transition-smooth hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{producto.producto}</h4>
                              <p className="text-sm text-gray-600">{producto.ventas} unidades vendidas</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-gray-900">${producto.ingresos.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Ingresos totales</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            </TabsContent>

            {/* Reporte de Operaciones */}
            <TabsContent value="operaciones" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SlideIn direction="up" delay={0.8}>
                  <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                    <CardHeader>
                      <CardTitle>Métricas Operacionales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { label: "Tiempo promedio por mesa", value: "42 min", icon: Clock },
                          { label: "Rotación de mesas", value: "3.2x", icon: RefreshCw },
                          { label: "Eficiencia de cocina", value: "87%", icon: Activity },
                          { label: "Satisfacción cliente", value: "4.7/5", icon: Users },
                        ].map((metric, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <metric.icon className="h-5 w-5 text-gray-600" />
                              <span className="text-gray-700">{metric.label}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </SlideIn>

                <SlideIn direction="up" delay={0.9}>
                  <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                    <CardHeader>
                      <CardTitle>Estado de Mesas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Ocupadas", value: 12, color: "#dc2626" },
                              { name: "Disponibles", value: 8, color: "#10b981" },
                              { name: "Reservadas", value: 4, color: "#f59e0b" },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {[
                              { name: "Ocupadas", value: 12, color: "#dc2626" },
                              { name: "Disponibles", value: 8, color: "#10b981" },
                              { name: "Reservadas", value: 4, color: "#f59e0b" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </SlideIn>
              </div>
            </TabsContent>

            {/* Reporte Financiero */}
            <TabsContent value="financiero" className="space-y-6">
              <SlideIn direction="up" delay={0.8}>
                <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
                  <CardHeader>
                    <CardTitle>Estado de Resultados</CardTitle>
                    <CardDescription>Resumen financiero del período seleccionado</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Concepto</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="text-right">% del Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Ingresos por Ventas</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">$357,000</TableCell>
                          <TableCell className="text-right">100%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">- Costo de Alimentos</TableCell>
                          <TableCell className="text-right text-red-600">$142,800</TableCell>
                          <TableCell className="text-right">40%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">- Gastos de Personal</TableCell>
                          <TableCell className="text-right text-red-600">$71,400</TableCell>
                          <TableCell className="text-right">20%</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="pl-6">- Gastos Operativos</TableCell>
                          <TableCell className="text-right text-red-600">$35,700</TableCell>
                          <TableCell className="text-right">10%</TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-bold">Utilidad Neta</TableCell>
                          <TableCell className="text-right font-bold text-blue-600">$107,100</TableCell>
                          <TableCell className="text-right font-bold">30%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </SlideIn>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </div>
    </div>
  )
}
