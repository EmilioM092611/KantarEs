import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Mail, Phone, Calendar, Users } from "lucide-react";
import type { NewUserForm } from "../../types/usuarios.types";

interface UserModalStep1Props {
  user: NewUserForm;
  onUserChange: (user: NewUserForm) => void;
  animationProps: any;
}

export function UserModalStep1({ user, onUserChange }: UserModalStep1Props) {
  const handleChange = (field: keyof NewUserForm, value: string) => {
    onUserChange({ ...user, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      <div className="group">
        <Label
          htmlFor="userName"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
        >
          <User className="w-4 h-4 text-red-500" />
          Nombre Completo *
        </Label>
        <Input
          id="userName"
          value={user.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Juan Pérez García"
          className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white"
          required
        />
      </div>

      <div className="group">
        <Label
          htmlFor="userEmail"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
        >
          <Mail className="w-4 h-4 text-red-500" />
          Correo Electrónico *
        </Label>
        <Input
          id="userEmail"
          type="email"
          value={user.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Ej: juan.perez@kantares.com"
          className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white"
          required
        />
      </div>

      <div className="group">
        <Label
          htmlFor="userPhone"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
        >
          <Phone className="w-4 h-4 text-red-500" />
          Teléfono <span className="text-xs text-gray-400">(Opcional)</span>
        </Label>
        <Input
          id="userPhone"
          value={user.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Ej: +52 55 1234 5678"
          className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white"
        />
      </div>

      <div className="group">
        <Label
          htmlFor="userGender"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
        >
          <Users className="w-4 h-4 text-red-500" />
          Género <span className="text-xs text-gray-400">(Opcional)</span>
        </Label>
        <Select
          value={user.gender}
          onValueChange={(value) => handleChange("gender", value)}
        >
          <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500 bg-white">
            <SelectValue placeholder="Seleccionar género" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masculino">
              <div className="flex items-center gap-2">Masculino</div>
            </SelectItem>
            <SelectItem value="femenino">
              <div className="flex items-center gap-2">Femenino</div>
            </SelectItem>
            <SelectItem value="otro">
              <div className="flex items-center gap-2">
                Otro / Prefiero no decir
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="group md:col-span-2">
        <Label
          htmlFor="userBirthDate"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
        >
          <Calendar className="w-4 h-4 text-red-500" />
          Fecha de Nacimiento{" "}
          <span className="text-xs text-gray-400">(Opcional)</span>
        </Label>
        <Input
          id="userBirthDate"
          type="date"
          value={user.birthDate}
          onChange={(e) => handleChange("birthDate", e.target.value)}
          className="border-gray-300 focus:border-red-500 focus:ring-red-500 transition-all bg-white w-full md:w-1/2"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>
    </div>
  );
}
