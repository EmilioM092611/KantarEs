"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  Package,
  Clock,
  Eye,
  EyeOff,
  Copy,
  Edit,
  MoreVertical,
  ImageOff,
} from "lucide-react";
import { motion } from "framer-motion";

export type ProductoUI = {
  id: number;
  nombre: string;
  sku?: string;
  precio: number;
  costo: number;
  stock: number;
  tiempo_prep: number;
  disponible: boolean;
  imagen?: string | null;
  categoria?: string | null;
};

type Props = {
  producto: ProductoUI;
  index?: number;
  onEditar: (p: ProductoUI) => void;
  onDuplicar: (p: ProductoUI) => void;
  onToggleDisponibilidad: (id: number) => void;
  onEliminar: (id: number) => void;
  muted?: boolean; // para "no disponibles"
};

export default function ProductCard({
  producto,
  index = 0,
  onEditar,
  onDuplicar,
  onToggleDisponibilidad,
  onEliminar,
  muted,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={`group border-none shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden bg-white p-0 gap-0 ${
          muted ? "opacity-75" : ""
        }`}
      >
        <div className="relative h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 overflow-hidden">
          {producto.imagen ? (
            <img
              src={producto.imagen}
              alt={producto.nombre}
              className={`block w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                muted ? "grayscale" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-16 w-16 text-zinc-400" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge
              className={
                producto.disponible
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-red-500 text-white hover:bg-red-600"
              }
            >
              {producto.disponible ? (
                <Eye className="h-3 w-3 mr-1" />
              ) : (
                <EyeOff className="h-3 w-3 mr-1" />
              )}
              {producto.disponible ? "Disponible" : "No disponible"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-1 line-clamp-1">
                {producto.nombre}
              </h3>
              <p className="text-xs text-zinc-500">SKU: {producto.sku}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Precio</p>
                </div>
                <p className="text-xl font-bold text-red-600">
                  ${producto.precio.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Package className="h-3 w-3 text-zinc-500" />
                  <p className="text-xs text-zinc-500">Stock</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    producto.stock < 10
                      ? "border-amber-300 text-amber-800 bg-amber-50"
                      : "border-zinc-300 text-zinc-700 bg-white"
                  }
                >
                  {producto.stock} uds
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-zinc-600">
                <Clock className="h-3 w-3" />
                <span className="text-xs">
                  Prep. {producto.tiempo_prep} min
                </span>
              </div>
              {producto.categoria && (
                <Badge
                  variant="outline"
                  className="border-amber-200 text-zinc-800 text-xs"
                >
                  {producto.categoria}
                </Badge>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditar(producto)}
                className="flex-1 active:scale-95 transition-all hover:border-red-300 rounded-lg"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="active:scale-95 transition-all hover:border-red-300 rounded-lg"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="backdrop-blur-md bg-white/90 border border-zinc-200 shadow-lg rounded-xl"
                >
                  <DropdownMenuItem onClick={() => onDuplicar(producto)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleDisponibilidad(producto.id)}
                  >
                    {producto.disponible ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {producto.disponible ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEliminar(producto.id)}
                    className="text-red-600"
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
