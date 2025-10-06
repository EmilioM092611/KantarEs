import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateReceptorDto {
  @Matches(/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/i, { message: 'RFC inválido' })
  rfc!: string;

  @IsNotEmpty()
  @MaxLength(160)
  razon_social!: string;

  // Catálogos SAT (ej: 601, 603, 605, 612, 616, ...)
  @Matches(/^[0-9]{3}$/)
  regimen_fiscal!: string;

  // Catálogo uso CFDI (ej: G01, G03, P01, CP01, ...)
  @Matches(/^[A-Z0-9]{3}$/)
  uso_cfdi!: string;

  @IsEmail()
  email?: string;
}
