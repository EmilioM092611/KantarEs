"use client";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  setPage: (n: number) => void;
};

export default function PaginationBar({ page, totalPages, setPage }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className="flex justify-center items-center gap-2">
      <Button
        variant="outline"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="gap-2 active:scale-95 transition-all hover:border-amber-300"
      >
        Anterior
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((n) => (
          <Button
            key={n}
            variant={n === page ? "default" : "outline"}
            size="icon"
            onClick={() => setPage(n)}
            className={`active:scale-95 transition-all ${
              n === page
                ? "bg-red-500 hover:bg-red-600"
                : "hover:border-amber-300"
            }`}
          >
            {n}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="gap-2 active:scale-95 transition-all hover:border-amber-300"
      >
        Siguiente
      </Button>
    </div>
  );
}
