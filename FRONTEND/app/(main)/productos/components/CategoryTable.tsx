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

export type CategoriaUI = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  orden?: number | null;
  cantidad_productos?: number | null;
  activa: boolean;
};

type Props = {
  categorias: CategoriaUI[];
  onEditar: (c: CategoriaUI) => void;
  onEliminar: (id: number) => void;
};

export default function CategoryTable({
  categorias,
  onEditar,
  onEliminar,
}: Props) {
  return (
    <Card className="border-none shadow-md bg-white rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 hover:bg-zinc-50">
            <TableHead className="font-semibold text-zinc-700">
              Nombre
            </TableHead>
            <TableHead className="font-semibold text-zinc-700">
              Descripción
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Orden
            </TableHead>
            <TableHead className="text-center font-semibold text-zinc-700">
              Productos
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
          {categorias.map((categoria) => (
            <TableRow
              key={categoria.id}
              className="border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <TableCell className="font-semibold text-zinc-900">
                {categoria.nombre}
              </TableCell>
              <TableCell className="text-zinc-600">
                {categoria.descripcion || "-"}
              </TableCell>
              <TableCell className="text-center text-zinc-600">
                {categoria.orden ?? "-"}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="border-zinc-300">
                  {categoria.cantidad_productos || 0} productos
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={
                    categoria.activa
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }
                >
                  {categoria.activa ? "Activa" : "Inactiva"}
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
                    <DropdownMenuItem onClick={() => onEditar(categoria)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEliminar(categoria.id)}
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
