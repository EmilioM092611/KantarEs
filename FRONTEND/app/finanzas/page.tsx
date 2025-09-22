"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FadeIn } from "@/components/fade-in"
import { SlideIn } from "@/components/slide-in"
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Receipt,
  Clock,
  AlertCircle,
  MoreHorizontal,
  FileText,
  Calculator,
  Target,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface Transaction {
  id: string
  type: "income" | "expense"
  category: string
  description: string
  amount: number
  date: string
  paymentMethod: string
  reference?: string
  status: "completed" | "pending" | "cancelled"
  tags?: string[]
}

interface Budget {
  id: string
  category: string
  budgeted: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  startDate: string
  endDate: string
  status: "on-track" | "over-budget" | "under-budget"
}

interface Report {
  id: string
  name: string
  type: "profit-loss" | "cash-flow" | "expense-analysis" | "revenue-analysis"
  period: string
  generatedDate: string
  status: "ready" | "generating" | "error"
}

interface ReportFilters {
  startDate: string
  endDate: string
  type: "ventas" | "gastos" | "inventario" | "empleados"
}

const transactionsData: Transaction[] = [
  {
    id: "TXN-001",
    type: "income",
    category: "Ventas",
    description: "Ventas del día - Mesa 5",
    amount: 1250.0,
    date: "2025-01-16",
    paymentMethod: "Efectivo",
    reference: "VENTA-001",
    status: "completed",
    tags: ["comida", "bebidas"],
  },
  {
    id: "TXN-002",
    type: "income",
    category: "Ventas",
    description: "Ventas del día - Mesa 12",
    amount: 890.5,
    date: "2025-01-16",
    paymentMethod: "Tarjeta",
    reference: "VENTA-002",
    status: "completed",
    tags: ["comida"],
  },
  {
    id: "TXN-003",
    type: "expense",
    category: "Inventario",
    description: "Compra de carne - Carnicería Central",
    amount: 2450.0,
    date: "2025-01-15",
    paymentMethod: "Transferencia",
    reference: "PO-001",
    status: "completed",
    tags: ["ingredientes", "carnes"],
  },
  {
    id: "TXN-004",
    type: "expense",
    category: "Servicios",
    description: "Pago de electricidad",
    amount: 1200.0,
    date: "2025-01-15",
    paymentMethod: "Transferencia",
    reference: "CFE-001",
    status: "completed",
    tags: ["servicios", "electricidad"],
  },
  {
    id: "TXN-005",
    type: "expense",
    category: "Nómina",
    description: "Pago de sueldos - Enero 2025",
    amount: 15000.0,
    date: "2025-01-14",
    paymentMethod: "Transferencia",
    reference: "NOM-001",
    status: "completed",
    tags: ["personal", "sueldos"],
  },
  {
    id: "TXN-006",
    type: "income",
    category: "Ventas",
    description: "Pedido delivery - App",
    amount: 450.0,
    date: "2025-01-16",
    paymentMethod: "Digital",
    reference: "DEL-001",
    status: "pending",
    tags: ["delivery", "app"],
  },
]

const budgetsData: Budget[] = [
  {
    id: "BUD-001",
    category: "Inventario",
    budgeted: 25000,
    spent: 18500,
    period: "monthly",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "on-track",
  },
  {
    id: "BUD-002",
    category: "Nómina",
    budgeted: 45000,
    spent: 45000,
    period: "monthly",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "on-track",
  },
  {
    id: "BUD-003",
    category: "Servicios",
    budgeted: 8000,
    spent: 9200,
    period: "monthly",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "over-budget",
  },
  {
    id: "BUD-004",
    category: "Marketing",
    budgeted: 5000,
    spent: 2100,
    period: "monthly",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    status: "under-budget",
  },
]

const reportsData: Report[] = [
  {
    id: "REP-001",
    name: "Estado de Resultados - Enero 2025",
    type: "profit-loss",
    period: "2025-01",
    generatedDate: "2025-01-16",
    status: "ready",
  },
  {
    id: "REP-002",
    name: "Flujo de Efectivo - Enero 2025",
    type: "cash-flow",
    period: "2025-01",
    generatedDate: "2025-01-16",
    status: "ready",
  },
  {
    id: "REP-003",
    name: "Análisis de Gastos - Q4 2024",
    type: "expense-analysis",
    period: "2024-Q4",
    generatedDate: "2025-01-15",
    status: "ready",
  },
]

const categories = {
  income: ["Ventas", "Servicios", "Otros Ingresos", "Intereses"],
  expense: ["Inventario", "Nómina", "Servicios", "Marketing", "Mantenimiento", "Impuestos", "Otros Gastos"],
}

const paymentMethods = ["Efectivo", "Tarjeta", "Transferencia", "Digital", "Cheque"]

export default function FinanzasPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(transactionsData)
  const [budgets, setBudgets] = useState<Budget[]>(budgetsData)
  const [reports, setReports] = useState<Report[]>(reportsData)

  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    startDate: "",
    endDate: "",
    type: "ventas",
  })

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || transaction.type === typeFilter
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter

    return matchesSearch && matchesType && matchesCategory && matchesStatus
  })

  // Calculate statistics
  const stats = {
    totalIncome: transactions
      .filter((t) => t.type === "income" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions
      .filter((t) => t.type === "expense" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    pendingTransactions: transactions.filter((t) => t.status === "pending").length,
    monthlyProfit: 0,
    budgetUtilization: budgets.reduce((sum, b) => sum + b.spent / b.budgeted, 0) / budgets.length,
    overBudgetCategories: budgets.filter((b) => b.status === "over-budget").length,
  }

  stats.monthlyProfit = stats.totalIncome - stats.totalExpenses

  const getTransactionTypeColor = (type: string) => {
    return type === "income" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 text-green-800 border-green-200"
      case "over-budget":
        return "bg-red-100 text-red-800 border-red-200"
      case "under-budget":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getBudgetStatusText = (status: string) => {
    switch (status) {
      case "on-track":
        return "En Meta"
      case "over-budget":
        return "Excedido"
      case "under-budget":
        return "Bajo Presupuesto"
      default:
        return "Desconocido"
    }
  }

  const openTransactionModal = (transaction?: Transaction) => {
    setEditingTransaction(transaction || null)
    setTransactionModalOpen(true)
  }

  const openBudgetModal = (budget?: Budget) => {
    setEditingBudget(budget || null)
    setBudgetModalOpen(true)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  const generateReport = () => {
    // Implement report generation logic here
  }

  return (
    <div className="p-8 space-y-8">
      {/* Enhanced Header */}
      <FadeIn>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Gestión Financiera
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Control completo de ingresos, gastos y presupuestos</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-80 h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-red-300 focus:ring-red-200 transition-all"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 h-12">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Ingresos</SelectItem>
                <SelectItem value="expense">Gastos</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="h-12 w-12 transition-all hover:scale-105 bg-transparent">
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Financial Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            title: "Ingresos del Mes",
            value: `$${stats.totalIncome.toLocaleString()}`,
            change: "+12.5% vs mes anterior",
            changeColor: "text-green-600",
            icon: TrendingUp,
            gradient: "from-green-500 to-green-600",
          },
          {
            title: "Gastos del Mes",
            value: `$${stats.totalExpenses.toLocaleString()}`,
            change: "+8.2% vs mes anterior",
            changeColor: "text-red-600",
            icon: TrendingDown,
            gradient: "from-red-500 to-red-600",
          },
          {
            title: "Ganancia Neta",
            value: `$${stats.monthlyProfit.toLocaleString()}`,
            change: stats.monthlyProfit > 0 ? "+15.3% vs mes anterior" : "-5.2% vs mes anterior",
            changeColor: stats.monthlyProfit > 0 ? "text-green-600" : "text-red-600",
            icon: stats.monthlyProfit > 0 ? ArrowUpRight : ArrowDownRight,
            gradient: stats.monthlyProfit > 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600",
          },
          {
            title: "Transacciones Pendientes",
            value: stats.pendingTransactions.toString(),
            change: "Requieren atención",
            changeColor: "text-yellow-600",
            icon: Clock,
            gradient: "from-yellow-500 to-yellow-600",
          },
          {
            title: "Uso de Presupuesto",
            value: `${(stats.budgetUtilization * 100).toFixed(1)}%`,
            change: "Promedio general",
            changeColor: "text-blue-600",
            icon: Target,
            gradient: "from-blue-500 to-blue-600",
          },
          {
            title: "Presupuestos Excedidos",
            value: stats.overBudgetCategories.toString(),
            change: "Categorías en rojo",
            changeColor: "text-red-600",
            icon: AlertCircle,
            gradient: "from-orange-500 to-orange-600",
          },
        ].map((stat, index) => (
          <SlideIn key={index} direction="up" delay={0.1 + index * 0.1}>
            <Card className="bg-white shadow-lg border-0 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                    <p className={`${stat.changeColor} text-xs mt-1 flex items-center gap-1`}>
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
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

      {/* Main Content Tabs */}
      <SlideIn direction="up" delay={0.5}>
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="transactions" className="text-base">
              <Receipt className="h-4 w-4 mr-2" />
              Transacciones
            </TabsTrigger>
            <TabsTrigger value="budgets" className="text-base">
              <Target className="h-4 w-4 mr-2" />
              Presupuestos
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-base">
              <FileText className="h-4 w-4 mr-2" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-base">
              <BarChart3 className="h-4 w-4 mr-2" />
              Análisis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <SlideIn direction="up" delay={0.1}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-red-600" />
                    Transacciones ({filteredTransactions.length})
                  </CardTitle>
                  <Button
                    onClick={() => openTransactionModal()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Transacción
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {[...categories.income, ...categories.expense].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Fecha</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Descripción</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Categoría</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Tipo</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Monto</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Método</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Estado</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction, index) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <td className="py-4 px-4 text-gray-700">{transaction.date}</td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-gray-900">{transaction.description}</div>
                                {transaction.reference && (
                                  <div className="text-sm text-gray-500">Ref: {transaction.reference}</div>
                                )}
                                {transaction.tags && (
                                  <div className="flex gap-1 mt-1">
                                    {transaction.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant="outline" className="bg-gray-50">
                                {transaction.category}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={getTransactionTypeColor(transaction.type)}>
                                {transaction.type === "income" ? "Ingreso" : "Gasto"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div
                                className={`font-bold text-lg ${
                                  transaction.type === "income" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-700">{transaction.paymentMethod}</td>
                            <td className="py-4 px-4">
                              <Badge className={getStatusColor(transaction.status)}>
                                {transaction.status === "completed"
                                  ? "Completado"
                                  : transaction.status === "pending"
                                    ? "Pendiente"
                                    : "Cancelado"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openTransactionModal(transaction)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar Recibo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteTransaction(transaction.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <SlideIn direction="up" delay={0.1}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-600" />
                    Presupuestos ({budgets.length})
                  </CardTitle>
                  <Button
                    onClick={() => openBudgetModal()}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Presupuesto
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets.map((budget, index) => (
                      <SlideIn key={budget.id} direction="up" delay={0.2 + index * 0.1}>
                        <Card className="border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                                  {budget.category}
                                </h3>
                                <p className="text-sm text-gray-600 capitalize">{budget.period}</p>
                                <p className="text-xs text-gray-500">
                                  {budget.startDate} - {budget.endDate}
                                </p>
                              </div>
                              <Badge className={getBudgetStatusColor(budget.status)}>
                                {getBudgetStatusText(budget.status)}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Presupuestado:</span>
                                <span className="font-semibold text-gray-900">${budget.budgeted.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Gastado:</span>
                                <span
                                  className={`font-semibold ${
                                    budget.spent > budget.budgeted ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  ${budget.spent.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Restante:</span>
                                <span
                                  className={`font-semibold ${
                                    budget.budgeted - budget.spent < 0 ? "text-red-600" : "text-green-600"
                                  }`}
                                >
                                  ${(budget.budgeted - budget.spent).toLocaleString()}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                                <div
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    budget.spent > budget.budgeted
                                      ? "bg-red-500"
                                      : budget.spent / budget.budgeted > 0.8
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${Math.min((budget.spent / budget.budgeted) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                              <div className="text-center text-sm text-gray-600">
                                {((budget.spent / budget.budgeted) * 100).toFixed(1)}% utilizado
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 transition-all hover:scale-105 bg-transparent"
                                onClick={() => openBudgetModal(budget)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteBudget(budget.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all hover:scale-105"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </SlideIn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <SlideIn direction="up" delay={0.1}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Reportes Financieros ({reports.length})
                  </CardTitle>
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report, index) => (
                      <SlideIn key={report.id} direction="up" delay={0.2 + index * 0.1}>
                        <Card className="border-2 border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                  {report.name}
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <p>Período: {report.period}</p>
                                  <p>Generado: {report.generatedDate}</p>
                                </div>
                              </div>
                              <Badge
                                className={
                                  report.status === "ready"
                                    ? "bg-green-100 text-green-800"
                                    : report.status === "generating"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }
                              >
                                {report.status === "ready"
                                  ? "Listo"
                                  : report.status === "generating"
                                    ? "Generando"
                                    : "Error"}
                              </Badge>
                            </div>

                            <div className="mb-4">
                              <Badge variant="outline" className="bg-gray-50">
                                {report.type === "profit-loss"
                                  ? "Estado de Resultados"
                                  : report.type === "cash-flow"
                                    ? "Flujo de Efectivo"
                                    : report.type === "expense-analysis"
                                      ? "Análisis de Gastos"
                                      : "Análisis de Ingresos"}
                              </Badge>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 transition-all hover:scale-105 bg-transparent"
                                disabled={report.status !== "ready"}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Descargar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 transition-all hover:scale-105 bg-transparent"
                                disabled={report.status !== "ready"}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </SlideIn>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideIn>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SlideIn direction="up" delay={0.1}>
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-red-600" />
                      Distribución de Gastos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center text-gray-500">
                        <PieChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Gráfico de distribución de gastos</p>
                        <p className="text-sm">Implementar con biblioteca de gráficos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>

              <SlideIn direction="up" delay={0.2}>
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-red-600" />
                      Tendencia de Ingresos vs Gastos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Gráfico de tendencias mensuales</p>
                        <p className="text-sm">Implementar con biblioteca de gráficos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>

              <SlideIn direction="up" delay={0.3}>
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-red-600" />
                      Métricas Clave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Margen de Ganancia</span>
                        <span className="font-bold text-green-600">
                          {((stats.monthlyProfit / stats.totalIncome) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-blue-700 font-medium">ROI Mensual</span>
                        <span className="font-bold text-blue-800 text-xl">15.2%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Costo por Transacción</span>
                        <span className="font-bold text-gray-900">
                          ${(stats.totalExpenses / transactions.length).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Ticket Promedio</span>
                        <span className="font-bold text-gray-900">
                          ${(stats.totalIncome / transactions.filter((t) => t.type === "income").length).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>

              <SlideIn direction="up" delay={0.4}>
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Banknote className="h-5 w-5 text-red-600" />
                      Flujo de Efectivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-green-700 font-medium">Efectivo Disponible</span>
                        <span className="font-bold text-green-800 text-xl">$45,230</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-blue-700 font-medium">En Bancos</span>
                        <span className="font-bold text-blue-800 text-xl">$128,450</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <span className="text-yellow-700 font-medium">Por Cobrar</span>
                        <span className="font-bold text-yellow-800 text-xl">$12,800</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-red-700 font-medium">Por Pagar</span>
                        <span className="font-bold text-red-800 text-xl">$8,950</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideIn>
            </div>
          </TabsContent>
        </Tabs>
      </SlideIn>

      {/* Transaction Modal */}
      <Dialog open={transactionModalOpen} onOpenChange={setTransactionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingTransaction ? "Editar Transacción" : "Nueva Transacción"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de transacción</Label>
                <Select defaultValue={editingTransaction?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select defaultValue={editingTransaction?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...categories.income, ...categories.expense].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" defaultValue={editingTransaction?.description} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" step="0.01" defaultValue={editingTransaction?.amount} />
              </div>
              <div>
                <Label htmlFor="date">Fecha</Label>
                <Input id="date" type="date" defaultValue={editingTransaction?.date} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Método de pago</Label>
                <Select defaultValue={editingTransaction?.paymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reference">Referencia (opcional)</Label>
                <Input id="reference" defaultValue={editingTransaction?.reference} />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
              <Input id="tags" defaultValue={editingTransaction?.tags?.join(", ")} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setTransactionModalOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white">
                {editingTransaction ? "Actualizar" : "Crear"} Transacción
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Modal */}
      <Dialog open={budgetModalOpen} onOpenChange={setBudgetModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetCategory">Categoría</Label>
                <Select defaultValue={editingBudget?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.expense.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="period">Período</Label>
                <Select defaultValue={editingBudget?.period}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="budgeted">Monto presupuestado</Label>
              <Input id="budgeted" type="number" step="0.01" defaultValue={editingBudget?.budgeted} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Fecha de inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportType">Tipo de reporte</Label>
                <Select
                  value={reportFilters.type}
                  onValueChange={(value) => setReportFilters({ ...reportFilters, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ventas">Ventas</SelectItem>
                    <SelectItem value="gastos">Gastos</SelectItem>
                    <SelectItem value="inventario">Inventario</SelectItem>
                    <SelectItem value="empleados">Empleados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBudgetModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={generateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Generar Reporte
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
