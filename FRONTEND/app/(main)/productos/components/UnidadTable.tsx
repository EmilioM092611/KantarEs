"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Trash2 } from "lucide-react";

export type UnidadUI = {
  id: number;
  nombre: string;
  abreviatura: string;
  tipo: string;
  factor_conversion?: number | null;
  cantidad_productos?: number | null;
};

type Props = {
  unidades: UnidadUI[];
  onEditar: (u: UnidadUI) => void;
  onEliminar: (id: number) => void;
};

export default function UnidadTable({ unidades, onEditar, onEliminar }: Props) {
  return (
    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 hover:bg-zinc-50">
            <TableHead className="font-semibold text-zinc-700">
              Nombre
            </TableHead>
            <TableHead className="font-semibold text-zinc-700">
              Abreviatura
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Tipo
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Factor de Conversión
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Productos
            </TableHead>
            <TableHead className="text-right font-semibold text-zinc-700">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unidades.map((unidad) => (
            <TableRow
              key={unidad.id}
              className="border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <TableCell className="font-semibold text-zinc-900">
                {unidad.nombre}
              </TableCell>
              <TableCell className="text-zinc-600">
                {unidad.abreviatura}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="outline"
                  className="border-blue-300 text-blue-800 bg-blue-50"
                >
                  {unidad.tipo}
                </Badge>
              </TableCell>
              <TableCell className="text-center text-zinc-600">
                {unidad.factor_conversion ?? "-"}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="border-zinc-300">
                  {unidad.cantidad_productos || 0} productos
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
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="backdrop-blur-md bg-white/90 border border-zinc-200 shadow-lg rounded-xl"
                  >
                    <DropdownMenuItem onClick={() => onEditar(unidad)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEliminar(unidad.id)}
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
