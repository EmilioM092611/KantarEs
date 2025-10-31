// Types para el módulo de usuarios

export interface NewUserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  confirmPassword: string;
  permissions: string[];
  gender: string;
  username: string;
  birthDate: string;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  joinDate: string;
  bio: string;
}

export interface SuccessMessage {
  title: string;
  description: string;
}

export interface UserStats {
  total: number;
  activos: number;
  suspendidos: number;
  rolesUnicos: number;
  porcentajeActivos: number;
}

export type ViewMode = "list" | "detail";
export type StepNumber = 1 | 2 | 3;

export interface Step {
  id: StepNumber;
  title: string;
  icon: any; // Lucide icon type
}
