import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseImageUploadReturn {
  preview: string | null;
  uploading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  remove: () => void;
  reset: () => void;
  setPreview: (preview: string | null) => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "error",
      });
      return;
    }

    // Validación de tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar los 5MB",
        variant: "error",
      });
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        setUploading(false);
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Error al cargar la imagen",
          variant: "error",
        });
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la imagen",
        variant: "error",
      });
      setUploading(false);
    }
  };

  const remove = () => {
    setPreview(null);
  };

  const reset = () => {
    setPreview(null);
    setUploading(false);
  };

  return {
    preview,
    uploading,
    handleChange,
    remove,
    reset,
    setPreview,
  };
}
