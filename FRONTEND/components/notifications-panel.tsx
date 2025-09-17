"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, ShoppingCart, Package, DollarSign, Users, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"

const notifications = [
  {
    id: 1,
    type: "order",
    title: "Nueva orden en Mesa 5",
    description: "3 tacos al pastor, 2 quesadillas",
    time: "Hace 2 minutos",
    icon: ShoppingCart,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    unread: true,
  },
  {
    id: 2,
    type: "inventory",
    title: "Stock bajo: Tortillas de Maíz",
    description: "Solo quedan 15 unidades en inventario",
    time: "Hace 15 minutos",
    icon: Package,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    unread: true,
  },
  {
    id: 3,
    type: "finance",
    title: "Recordatorio: Corte de caja pendiente",
    description: "Es hora de realizar el corte de caja del turno",
    time: "Hace 30 minutos",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
    unread: true,
  },
  {
    id: 4,
    type: "staff",
    title: "Personal: María llegó tarde",
    description: "Llegada registrada a las 9:15 AM",
    time: "Hace 1 hora",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    unread: false,
  },
  {
    id: 5,
    type: "alert",
    title: "Mesa 12 esperando hace 20 minutos",
    description: "Orden #1234 - Pozole Rojo, Enchiladas",
    time: "Hace 1 hora",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    unread: false,
  },
  {
    id: 6,
    type: "success",
    title: "Orden completada - Mesa 8",
    description: "Cliente satisfecho, propina del 15%",
    time: "Hace 2 horas",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    unread: false,
  },
]

interface NotificationsPanelProps {
  children: React.ReactNode
}

export function NotificationsPanel({ children }: NotificationsPanelProps) {
  const [notificationsList, setNotificationsList] = useState(notifications)
  const unreadCount = notificationsList.filter((n) => n.unread).length

  const markAsRead = (id: number) => {
    setNotificationsList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotificationsList((prev) => prev.map((notification) => ({ ...notification, unread: false })))
  }

  const removeNotification = (id: number) => {
    setNotificationsList((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-96 sm:w-96">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Notificaciones</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Marcar todas como leídas
              </Button>
            )}
          </div>
          <SheetDescription>
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : "No hay notificaciones nuevas"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6">
          <div className="space-y-3">
            {notificationsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No hay notificaciones</p>
                <p className="text-sm text-gray-400">Cuando tengas nuevas notificaciones aparecerán aquí</p>
              </div>
            ) : (
              notificationsList.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    notification.unread ? "bg-white border-red-200 shadow-sm" : "bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => notification.unread && markAsRead(notification.id)}
                >
                  {notification.unread && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${notification.bgColor}`}>
                      <notification.icon className={`h-5 w-5 ${notification.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-medium text-sm ${notification.unread ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <p className={`text-sm mt-1 ${notification.unread ? "text-gray-600" : "text-gray-500"}`}>
                        {notification.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{notification.time}</span>
                        {notification.unread && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                            Nuevo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
