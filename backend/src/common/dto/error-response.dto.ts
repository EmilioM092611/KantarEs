// backend/src/common/dto/error-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
export class ErrorDetailDto {
  @ApiProperty({
    example: 'P2002',
    description: 'Código de error específico',
    required: false,
  })
  code?: string;

  @ApiProperty({
    example: ['email', 'username'],
    description: 'Campos relacionados con el error',
    required: false,
  })
  fields?: string[];

  @ApiProperty({
    description: 'Información adicional del error',
    required: false,
  })
  meta?: any;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Siempre false para errores',
  })
  success: boolean;

  @ApiProperty({
    example: 400,
    description: 'Código de estado HTTP',
  })
  statusCode: number;

  @ApiProperty({
    example: ['El email ya está registrado'],
    description: 'Mensajes de error',
    type: [String],
  })
  message: string[];

  @ApiProperty({
    type: ErrorDetailDto,
    description: 'Detalles adicionales del error',
    required: false,
  })
  errors?: ErrorDetailDto;

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
