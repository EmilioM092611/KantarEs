"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CalendarIcon,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { format, subDays } from "date-fns"
import { es } from "date-fns/locale"
import React from "react"

// Datos de ejemplo para los gráficos
const ventasPorHora = [
  { hora: "08:00", ventas: 1200, ordenes: 8 },
  { hora: "09:00", ventas: 1800, ordenes: 12 },
  { hora: "10:00", ventas: 2400, ordenes: 16 },
  { hora: "11:00", ventas: 3200, ordenes: 22 },
  { hora: "12:00", ventas: 4800, ordenes: 32 },
  { hora: "13:00", ventas: 6200, ordenes: 41 },
  { hora: "14:00", ventas: 7800, ordenes: 52 },
  { hora: "15:00", ventas: 6400, ordenes: 43 },
  { hora: "16:00", ventas: 4200, ordenes: 28 },
  { hora: "17:00", ventas: 5600, ordenes: 37 },
  { hora: "18:00", ventas: 7200, ordenes: 48 },
  { hora: "19:00", ventas: 8900, ordenes: 59 },
  { hora: "20:00", ventas: 9600, ordenes: 64 },
  { hora: "21:00", ventas: 7800, ordenes: 52 },
  { hora: "22:00", ventas: 4200, ordenes: 28 },
]

const ventasPorDia = [
  { dia: "Lun", ventas: 45678, meta: 50000 },
  { dia: "Mar", ventas: 52341, meta: 50000 },
  { dia: "Mié", ventas: 48923, meta: 50000 },
  { dia: "Jue", ventas: 56789, meta: 50000 },
  { dia: "Vie", ventas: 67234, meta: 50000 },
  { dia: "Sáb", ventas: 78456, meta: 60000 },
  { dia: "Dom", ventas: 71234, meta: 60000 },
]

const productosMasVendidos = [
  { nombre: "Tacos al Pastor", ventas: 2250, porcentaje: 28 },
  { nombre: "Quesadillas", ventas: 1920, porcentaje: 24 },
  { nombre: "Pozole Rojo", ventas: 1680, porcentaje: 21 },
  { nombre: "Enchiladas", ventas: 1440, porcentaje: 18 },
  { nombre: "Otros", ventas: 720, porcentaje: 9 },
]

const metodosPago = [
  { metodo: "Efectivo", valor: 35, color: "#DC2626" },
  { metodo: "Tarjeta", valor: 45, color: "#3B82F6" },
  { metodo: "Transferencia", valor: 20, color: "#10B981" },
]

const heatmapData = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][day],
    hour,
    value: Math.floor(Math.random() * 10000) + 1000,
    intensity: Math.random(),
  })),
).flat()

export default function AnalisisPage() {
  const [fechaInicio, setFechaInicio] = useState<Date>(subDays(new Date(), 7))
  const [fechaFin, setFechaFin] = useState<Date>(new Date())
  const [periodo, setPeriodo] = useState("7d")

  const estadisticasPrincipales = {
    ventasTotal: 45678,
    cambioVentas: 12.5,
    ordenesTotal: 234,
    cambioOrdenes: -3.2,
    ticketPromedio: 195,
    cambioTicket: 8.7,
    clientesUnicos: 189,
    cambioClientes: 15.3,
  }

  const aplicarPeriodo = (nuevoPeriodo: string) => {
    setPeriodo(nuevoPeriodo)
    const hoy = new Date()

    switch (nuevoPeriodo) {
      case "1d":
        setFechaInicio(hoy)
        setFechaFin(hoy)
        break
      case "7d":
        setFechaInicio(subDays(hoy, 7))
        setFechaFin(hoy)
        break
      case "30d":
        setFechaInicio(subDays(hoy, 30))
        setFechaFin(hoy)
        break
      case "90d":
        setFechaInicio(subDays(hoy, 90))
        setFechaFin(hoy)
        break
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-full">
        {/* Header con filtros */}
        <FadeIn>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estadísticas Financieras</h1>
              <p className="text-gray-600 mt-1">Dashboard de métricas y tendencias de ventas</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Períodos rápidos */}
              <div className="flex gap-2">
                {[
                  { key: "1d", label: "Hoy" },
                  { key: "7d", label: "7 días" },
                  { key: "30d", label: "30 días" },
                  { key: "90d", label: "90 días" },
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

              {/* Selector de fechas */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[
            {
              title: "Ventas Totales",
              value: estadisticasPrincipales.ventasTotal,
              change: estadisticasPrincipales.cambioVentas,
              icon: TrendingUp,
              gradient: "from-green-50 to-green-100",
              border: "border-green-200",
              textColor: "text-green-700",
              valueColor: "text-green-900",
              iconColor: "text-green-600",
              isPositive: true,
            },
            {
              title: "Órdenes",
              value: estadisticasPrincipales.ordenesTotal,
              change: estadisticasPrincipales.cambioOrdenes,
              icon: ShoppingCart,
              gradient: "from-blue-50 to-blue-100",
              border: "border-blue-200",
              textColor: "text-blue-700",
              valueColor: "text-blue-900",
              iconColor: "text-blue-600",
              isPositive: false,
            },
            {
              title: "Ticket Promedio",
              value: estadisticasPrincipales.ticketPromedio,
              change: estadisticasPrincipales.cambioTicket,
              icon: DollarSign,
              gradient: "from-purple-50 to-purple-100",
              border: "border-purple-200",
              textColor: "text-purple-700",
              valueColor: "text-purple-900",
              iconColor: "text-purple-600",
              isPositive: true,
            },
            {
              title: "Clientes Únicos",
              value: estadisticasPrincipales.clientesUnicos,
              change: estadisticasPrincipales.cambioClientes,
              icon: Users,
              gradient: "from-orange-50 to-orange-100",
              border: "border-orange-200",
              textColor: "text-orange-700",
              valueColor: "text-orange-900",
              iconColor: "text-orange-600",
              isPositive: true,
            },
          ].map((stat, index) => (
            <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
              <Card
                className={`bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.border} transition-smooth hover:shadow-xl hover:scale-105`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`${stat.textColor} font-medium`}>{stat.title}</p>
                      <h2 className={`text-4xl font-bold ${stat.valueColor} mt-2`}>
                        {stat.title.includes("Ticket") || stat.title.includes("Ventas") ? "$" : ""}
                        {stat.value.toLocaleString()}
                      </h2>
                      <div className="flex items-center gap-2 mt-3">
                        {stat.isPositive ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${stat.isPositive ? "text-green-600" : "text-red-600"}`}>
                          {Math.abs(stat.change)}%
                        </span>
                        <span className="text-gray-500 text-sm">vs período anterior</span>
                      </div>
                    </div>
                    <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center">
                      {React.createElement(stat.icon, { className: `w-8 h-8 ${stat.iconColor}` })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Gráfico de ventas por hora */}
          <SlideIn direction="up" delay={0.5}>
            <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold text-gray-900">Ventas por Hora</CardTitle>
                  <Select defaultValue="hoy">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="ayer">Ayer</SelectItem>
                      <SelectItem value="semana">Esta Semana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ventasPorHora}>
                    <defs>
                      <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "ventas" ? `$${value.toLocaleString()}` : value,
                        name === "ventas" ? "Ventas" : "Órdenes",
                      ]}
                    />
                    <Area type="monotone" dataKey="ventas" stroke="#DC2626" fillOpacity={1} fill="url(#colorVentas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </SlideIn>

          {/* Gráfico de ventas por día */}
          <SlideIn direction="up" delay={0.6}>
            <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Ventas vs Meta Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ventasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="ventas" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="meta" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Gráficos secundarios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Productos más vendidos */}
          <SlideIn direction="up" delay={0.7}>
            <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Productos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productosMasVendidos.map((producto, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between animate-fade-in"
                      style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{producto.nombre}</p>
                          <p className="text-sm text-gray-500">{producto.porcentaje}% del total</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">${producto.ventas.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          {/* Métodos de pago */}
          <SlideIn direction="up" delay={0.8}>
            <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={metodosPago} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="valor">
                      {metodosPago.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {metodosPago.map((metodo, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between animate-fade-in"
                      style={{ animationDelay: `${0.9 + index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metodo.color }}></div>
                        <span className="text-sm text-gray-600">{metodo.metodo}</span>
                      </div>
                      <span className="text-sm font-medium">{metodo.valor}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>

          {/* Métricas adicionales */}
          <SlideIn direction="up" delay={0.9}>
            <Card className="bg-white shadow-lg border-0 transition-smooth hover:shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Métricas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Tiempo promedio por mesa", value: "45 min", icon: Clock },
                    { title: "Rotación de mesas", value: "3.2x", icon: TrendingUp },
                    { title: "Satisfacción cliente", value: "4.8/5", icon: Users },
                  ].map((metric, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-smooth hover:bg-gray-100 animate-fade-in"
                      style={{ animationDelay: `${1.0 + index * 0.1}s` }}
                    >
                      <div>
                        <p className="text-sm text-gray-600">{metric.title}</p>
                        <p className="font-semibold text-gray-900">{metric.value}</p>
                      </div>
                      {React.createElement(metric.icon, { className: "h-8 w-8 text-gray-400" })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </SlideIn>
        </div>

        {/* Mapa de calor */}
        <SlideIn direction="up" delay={1.0}>
          <Card className="bg-white shadow-lg border-0 w-full transition-smooth hover:shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Mapa de Calor - Ventas por Día y Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 lg:p-6">
              <div className="overflow-x-auto w-full">
                <div className="grid grid-cols-25 gap-1 min-w-[800px]">
                  {/* Headers de horas */}
                  <div></div>
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="text-xs text-gray-500 text-center p-1">
                      {i.toString().padStart(2, "0")}
                    </div>
                  ))}

                  {/* Datos del heatmap */}
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dia, dayIndex) => (
                    <>
                      <div key={dia} className="text-xs text-gray-500 flex items-center justify-center">
                        {dia}
                      </div>
                      {Array.from({ length: 24 }, (_, hourIndex) => {
                        const data = heatmapData.find((d) => d.day === dia && d.hour === hourIndex)
                        return (
                          <div
                            key={`${dia}-${hourIndex}`}
                            className="aspect-square rounded cursor-pointer hover:scale-110 transition-transform animate-fade-in"
                            style={{
                              backgroundColor: `rgba(220, 38, 38, ${data?.intensity || 0})`,
                              animationDelay: `${1.1 + (dayIndex * 24 + hourIndex) * 0.01}s`,
                            }}
                            title={`${dia} ${hourIndex}:00 - $${data?.value?.toLocaleString() || 0}`}
                          />
                        )
                      })}
                    </>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Menos ventas</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: `rgba(220, 38, 38, ${(i + 1) * 0.2})` }}
                    />
                  ))}
                </div>
                <span>Más ventas</span>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </div>
  )
}
