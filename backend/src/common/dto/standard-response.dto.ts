// backend/src/common/dto/standard-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class StandardResponseDto<T = any> {
  @ApiProperty({
    example: true,
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean;

  @ApiProperty({
    description: 'Datos de respuesta',
    required: false,
  })
  data?: T;

  @ApiProperty({
    example: 'Operación completada exitosamente',
    description: 'Mensaje descriptivo de la operación',
    required: false,
  })
  message?: string;

  @ApiProperty({
    example: '2025-10-15T10:30:00.000Z',
    description: 'Timestamp de la respuesta',
  })
  timestamp: string;

  @ApiProperty({
    example: '/api/v1/productos',
    description: 'Ruta del endpoint',
  })
  path: string;

  @ApiProperty({
    example: 'GET',
    description: 'Método HTTP usado',
  })
  method: string;
}
