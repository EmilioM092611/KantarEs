"use client";
import { Search, Grid3x3, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Categoria = { id: number; nombre: string };

type Props = {
  busqueda: string;
  onBusqueda: (v: string) => void;
  categoriaFiltro?: string;
  onCategoria: (v: string) => void;
  categorias: Categoria[];
  vista: "cards" | "table";
  onVista: (v: "cards" | "table") => void;
};

export default function SearchAndFilters({
  busqueda,
  onBusqueda,
  categoriaFiltro,
  onCategoria,
  categorias,
  vista,
  onVista,
}: Props) {
  return (
    <Card className="border-none shadow-md bg-white rounded-2xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => onBusqueda(e.target.value)}
              className="pl-10 border-zinc-200 focus:border-red-500 focus:ring-red-500 rounded-xl"
            />
          </div>

          <Select value={categoriaFiltro || "all"} onValueChange={onCategoria}>
            <SelectTrigger className="w-full md:w-[200px] border-zinc-200 focus:border-red-500 focus:ring-red-500 rounded-xl">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={vista === "cards" ? "default" : "outline"}
              size="icon"
              onClick={() => onVista("cards")}
              className={`active:scale-95 transition-all rounded-xl ${
                vista === "cards"
                  ? "bg-red-500 hover:bg-red-600"
                  : "hover:border-red-300"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={vista === "table" ? "default" : "outline"}
              size="icon"
              onClick={() => onVista("table")}
              className={`active:scale-95 transition-all rounded-xl ${
                vista === "table"
                  ? "bg-red-500 hover:bg-red-600"
                  : "hover:border-red-300"
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
