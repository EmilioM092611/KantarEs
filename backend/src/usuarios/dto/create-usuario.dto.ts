import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'mesero01' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'mesero@kantares.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '555-1234', required: false })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido_paterno: string;

  @ApiProperty({ example: 'García', required: false })
  @IsString()
  @IsOptional()
  apellido_materno?: string;

  @ApiProperty({ example: 4, description: 'ID del rol (4=Mesero)' })
  @IsNumber()
  @IsNotEmpty()
  id_rol: number;

  @ApiProperty({ example: '1234', required: false })
  @IsString()
  @IsOptional()
  pin_rapido?: string;
}
