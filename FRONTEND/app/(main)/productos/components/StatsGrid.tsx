"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Eye, Layers, Filter } from "lucide-react";

type Props = {
  totalProductos: number;
  disponibles: number;
  stockBajo: number;
  totalCategorias: number;
};

export default function StatsGrid({
  totalProductos,
  disponibles,
  stockBajo,
  totalCategorias,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 mb-1">Total Productos</p>
              <p className="text-2xl font-bold text-zinc-900">
                {totalProductos}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 mb-1">Disponibles</p>
              <p className="text-2xl font-bold text-zinc-900">{disponibles}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Eye className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-amber-50 to-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 mb-1">Stock Bajo</p>
              <p className="text-2xl font-bold text-zinc-900">{stockBajo}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600 mb-1">Categorías</p>
              <p className="text-2xl font-bold text-zinc-900">
                {totalCategorias}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Filter className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
