// ============================================
// ARCHIVO: backend/src/usuarios/dto/create-usuario.dto.ts
// ============================================

import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  MinLength,
  IsDateString, // ✅ AGREGADO
  MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
  // ==================== DATOS DE PERSONA ====================

  @IsString()
  @MaxLength(60)
  nombre: string;

  @IsString()
  @MaxLength(60)
  apellido_paterno: string;

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

  // ==================== DATOS DE USUARIO ====================

  @IsString()
  @MaxLength(50)
  username: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsInt()
  id_rol: number; // 1=Admin, 2=Gerente, 3=Cajero, 4=Mesero, 5=Cocinero, 6=Bartender
}
