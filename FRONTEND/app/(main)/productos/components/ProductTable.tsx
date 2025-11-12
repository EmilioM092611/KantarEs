"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ImageOff,
  Edit,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";

import type { ProductoUI } from "./ProductCard";

type Props = {
  productos: ProductoUI[];
  onEditar: (p: ProductoUI) => void;
  onDuplicar: (p: ProductoUI) => void;
  onToggleDisponibilidad: (id: number) => void;
  onEliminar: (id: number) => void;
};

export default function ProductTable({
  productos,
  onEditar,
  onDuplicar,
  onToggleDisponibilidad,
  onEliminar,
}: Props) {
  return (
    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 hover:bg-zinc-50">
            <TableHead className="font-semibold text-zinc-700">
              Producto
            </TableHead>
            <TableHead className="font-semibold text-zinc-700">SKU</TableHead>
            <TableHead className="font-semibold text-zinc-700">
              Categoría
            </TableHead>
            <TableHead className="text-right font-semibold text-zinc-700">
              Precio
            </TableHead>
            <TableHead className="text-right font-semibold text-zinc-700">
              Costo
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Stock
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Prep.
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Estado
            </TableHead>
            <TableHead className="text-right font-semibold text-zinc-700">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productos.map((producto) => (
            <TableRow
              key={producto.id}
              className="border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="block w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-zinc-900">
                    {producto.nombre}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-zinc-600">{producto.sku}</TableCell>
              <TableCell>
                {producto.categoria && (
                  <Badge
                    variant="outline"
                    className="border-amber-200 text-zinc-800"
                  >
                    {producto.categoria}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold text-red-600">
                ${producto.precio.toFixed(2)}
              </TableCell>
              <TableCell className="text-right text-zinc-600">
                ${producto.costo.toFixed(2)}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className={
                    producto.stock < 10
                      ? "border-amber-300 text-amber-800 bg-amber-50"
                      : "border-zinc-300 text-zinc-700 bg-white"
                  }
                >
                  {producto.stock}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-zinc-600">
                {producto.tiempo_prep} min
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={
                    producto.disponible
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  {producto.disponible ? "Disponible" : "No disponible"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="active:scale-95 transition-all"
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="backdrop-blur-md bg-white/90 border border-zinc-200 shadow-lg rounded-xl"
                  >
                    <DropdownMenuItem onClick={() => onEditar(producto)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
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
    </Card>
  );
}
