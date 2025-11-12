import { useState } from "react";
import type { Producto } from "@/lib/api/productos";

type StepNumber = 1 | 2 | 3;

export function useProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [formData, setFormData] = useState<Partial<Producto>>({});
  const [step, setStep] = useState<StepNumber>(1);
  const [animationDirection, setAnimationDirection] = useState(1);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const openNew = (unidadesMedida: any[]) => {
    setEditingProduct(null);
    setFormData({
      disponible: true,
      costo: 0,
      precio: 0,
      tiempo_prep: 0,
      stock: 0,
      unidad_medida_id:
        unidadesMedida.length > 0 ? unidadesMedida[0].id : undefined,
    });
    setImagenPreview(null);
    setStep(1);
    setAnimationDirection(1);
    setIsOpen(true);
  };

  const openEdit = (producto: Producto) => {
    setEditingProduct(producto);
    setFormData(producto);
    setImagenPreview(producto.imagen || null);
    setStep(1);
    setAnimationDirection(1);
    setIsOpen(true);
  };

  const nextStep = () => {
    if (step < 3) {
      setAnimationDirection(1);
      setStep((step + 1) as StepNumber);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setAnimationDirection(-1);
      setStep((step - 1) as StepNumber);
    }
  };

  const close = () => {
    setIsOpen(false);
  };

  const reset = () => {
    setEditingProduct(null);
    setFormData({});
    setStep(1);
    setAnimationDirection(1);
    setImagenPreview(null);
    setSubiendoImagen(false);
  };

  return {
    isOpen,
    editingProduct,
    formData,
    step,
    animationDirection,
    imagenPreview,
    subiendoImagen,
    setIsOpen,
    setFormData,
    setStep,
    setAnimationDirection,
    setImagenPreview,
    setSubiendoImagen,
    openNew,
    openEdit,
    nextStep,
    prevStep,
    close,
    reset,
  };
}
