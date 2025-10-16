// backend/src/common/dto/validation-error.dto.ts - CORREGIDO
import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDetailDto {
  @ApiProperty({ example: 'email' })
  property: string;

  @ApiProperty({ example: 'email must be a valid email address' })
  message: string;

  @ApiProperty({ example: { isEmail: 'email must be a valid email address' } })
  constraints: Record<string, string>;

  @ApiProperty({ example: 'invalid@' })
  value?: any;
}

// CORREGIDO: Extender solo conceptualmente, no TypeScript
export class ValidationErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Siempre false para errores',
  })
  success: boolean = false;

  @ApiProperty({
    example: 400,
    description: 'Código de estado HTTP para validación',
  })
  statusCode: number = 400;

  @ApiProperty({
    example: ['El email ya está registrado'],
    description: 'Mensajes de error',
    type: [String],
  })
  message: string[];

  @ApiProperty({
    type: [ValidationErrorDetailDto],
    description: 'Detalles de validación',
  })
  errors: ValidationErrorDetailDto[];

  @ApiProperty({
    example: '2025-10-15T10:30:00.000Z',
    description: 'Timestamp del error',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/v1/usuarios',
    description: 'Ruta donde ocurrió el error',
  })
  path: string;

  @ApiProperty({
    example: 'POST',
    description: 'Método HTTP usado',
  })
  method: string;
}
