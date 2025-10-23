// backend/src/configuracion/dto/configuracion-general.dto.ts

import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class RedesSocialesDto {
  @ApiPropertyOptional({ example: 'https://facebook.com/kantares' })
  @IsUrl()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/kantares' })
  @IsUrl()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/kantares' })
  @IsUrl()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://tiktok.com/@kantares' })
  @IsUrl()
  @IsOptional()
  tiktok?: string;
}

export class ConfiguracionGeneralDto {
  @ApiProperty({ example: 'KANTARES', description: 'Nombre del restaurante' })
  @IsString()
  nombre_restaurante: string;

  @ApiProperty({ example: 'Av. Revolución 123, CDMX' })
  @IsString()
  direccion: string;

  @ApiProperty({ example: '+52 55 1234 5678' })
  @IsString()
  telefono: string;

  @ApiProperty({ example: 'info@kantares.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'XXX000000XXX' })
  @IsString()
  rfc: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsUrl()
  @IsOptional()
  logo_url?: string;

  @ApiPropertyOptional({ example: 'Sabor que enamora' })
  @IsString()
  @IsOptional()
  slogan?: string;

  @ApiPropertyOptional({ example: 'https://www.kantares.com' })
  @IsUrl()
  @IsOptional()
  sitio_web?: string;

  @ApiPropertyOptional({ type: RedesSocialesDto })
  @ValidateNested()
  @Type(() => RedesSocialesDto)
  @IsOptional()
  redes_sociales?: RedesSocialesDto;
}
