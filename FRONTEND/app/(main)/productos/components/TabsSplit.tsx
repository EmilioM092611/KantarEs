"use client";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, Ruler } from "lucide-react";

type Props = { className?: string };

export default function TabsSplit({ className }: Props) {
  return (
    <div className={`flex items-center justify-between ${className ?? ""}`}>
      {/* Izquierda: Productos */}
      <TabsList className="bg-white border border-zinc-200 shadow-md rounded-xl p-1">
        <TabsTrigger
          value="todos"
          className="rounded-lg transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          Todos
        </TabsTrigger>
        <TabsTrigger
          value="disponibles"
          className="rounded-lg transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          Disponibles
        </TabsTrigger>
        <TabsTrigger
          value="no_disponibles"
          className="rounded-lg transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          No disponibles
        </TabsTrigger>
      </TabsList>

      {/* Derecha: Gestión */}
      <TabsList className="bg-white border border-zinc-200 shadow-md rounded-xl p-1">
        <TabsTrigger
          value="categorias"
          className="rounded-lg transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          <Tag className="h-4 w-4 mr-2" />
          Categorías
        </TabsTrigger>
        <TabsTrigger
          value="unidades_medida"
          className="rounded-lg transition-all data-[state=active]:bg-red-500 data-[state=active]:text-white"
        >
          <Ruler className="h-4 w-4 mr-2" />
          Unidades de Medida
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
