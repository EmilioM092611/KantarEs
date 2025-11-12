"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";

type Props = {
  showCreate?: boolean;
  onCreate?: () => void;
  message: string;
};

export default function EmptyProducts({
  showCreate,
  onCreate,
  message,
}: Props) {
  return (
    <Card className="border-none shadow-md bg-white rounded-2xl">
      <CardContent className="p-12">
        <div className="text-center">
          <Package className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            No hay productos
          </h3>
          <p className="text-zinc-600 mb-6">{message}</p>
          {showCreate && (
            <Button
              onClick={onCreate}
              className="bg-red-500 hover:bg-red-600 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Producto
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
