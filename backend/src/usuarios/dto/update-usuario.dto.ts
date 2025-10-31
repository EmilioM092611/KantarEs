// ============================================
// ARCHIVO: backend/src/usuarios/dto/update-usuario.dto.ts
// ============================================

import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class UpdateUsuarioDto {
  // ==================== DATOS DE PERSONA (OPCIONALES) ====================

  @IsString()
  @MaxLength(60)
  @IsOptional()
  nombre?: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  apellido_paterno?: string;

  @IsString()
  @MaxLength(60)
  @IsOptional()
  apellido_materno?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  // ✅ CAMPO AGREGADO PARA FECHA DE NACIMIENTO
  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: string; // Formato: YYYY-MM-DD (ej: "2000-01-15")

  @IsInt()
  @IsOptional()
  id_genero?: number; // 1=Masculino, 2=Femenino, 3=Otro

  // ==================== DATOS DE USUARIO (OPCIONALES) ====================

  @IsString()
  @MaxLength(50)
  @IsOptional()
  username?: string;

  @IsEmail()
  @MaxLength(120)
  @IsOptional()
  email?: string;

  @IsInt()
  @IsOptional()
  id_rol?: number; // 1=Admin, 2=Gerente, 3=Cajero, 4=Mesero, 5=Cocinero, 6=Bartender

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  // ❌ ELIMINADO: password: any;
  // Las contraseñas se actualizan mediante POST /usuarios/:id/cambiar-password
}
