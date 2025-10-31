import type { NewUserForm } from "../../types/usuarios.types";

export interface StepValidation {
  isValid: boolean;
  message?: string;
}

/**
 * Valida el paso 1: Información del usuario
 */
export function validateStep1(user: NewUserForm): StepValidation {
  if (!user.name.trim()) {
    return { isValid: false, message: "El nombre es requerido" };
  }
  if (!user.email.trim()) {
    return { isValid: false, message: "El email es requerido" };
  }
  if (user.email && !isValidEmail(user.email)) {
    return { isValid: false, message: "El email no es válido" };
  }
  return { isValid: true };
}

/**
 * Valida el paso 2: Cuenta & Seguridad
 */
export function validateStep2(
  user: NewUserForm,
  isEditing: boolean
): StepValidation {
  if (!user.username.trim()) {
    return { isValid: false, message: "El nombre de usuario es requerido" };
  }

  if (!isEditing) {
    if (!user.password.trim()) {
      return { isValid: false, message: "La contraseña es requerida" };
    }
    if (user.password.length < 8) {
      return {
        isValid: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      };
    }
    if (user.password !== user.confirmPassword) {
      return { isValid: false, message: "Las contraseñas no coinciden" };
    }
  }

  return { isValid: true };
}

/**
 * Valida el paso 3: Roles & Permisos
 */
export function validateStep3(user: NewUserForm): StepValidation {
  if (!user.role.trim()) {
    return { isValid: false, message: "El rol es requerido" };
  }
  return { isValid: true };
}

/**
 * Valida formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
