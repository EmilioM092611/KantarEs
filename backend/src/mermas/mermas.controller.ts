/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MermasService } from './mermas.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Mermas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mermas')
export class MermasController {
  constructor(private readonly svc: MermasService) {}

  @Post()
  @Roles('Administrador', 'Gerente', 'Supervisor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar una merma de inventario',
    description:
      'Registra pérdida de productos por diversos motivos: caducidad, rotura, deterioro, derrame, pruebas de calidad, error humano, robo, etc. Proceso: identifica producto y cantidad perdida, registra motivo/observaciones en campo observaciones, opcionalmente adjunta URL de evidencia (foto), especifica usuario responsable y tipo de movimiento de inventario. Genera movimiento de salida en inventario (resta stock del producto). Valida que producto exista. IMPORTANTE para control de costos, análisis de pérdidas, detección de patrones (productos con alta merma), mejora de procesos, auditorías. Afecta rentabilidad directamente. DTO requerido: id_producto, cantidad, id_tipo_movimiento (tipo de merma), id_usuario, opcionalmente motivo y evidencia_url.',
  })
  @ApiResponse({
    status: 201,
    description: 'Merma registrada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Merma registrada exitosamente',
        data: {
          id_movimiento: 7890,
          id_tipo_movimiento: 5,
          id_producto: 12,
          cantidad: '12',
          id_unidad_medida: 1,
          fecha_movimiento: '2025-10-15T20:00:00.000Z',
          observaciones: 'Producto caducado - fecha vencimiento 2025-10-10',
          id_usuario: 8,
          id_orden: null,
          id_compra: null,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o producto no encontrado',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['Producto no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador, Gerente y Supervisor pueden registrar mermas',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Producto con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  crear(@Body() dto: any) {
    return this.svc.crear(dto);
  }
}
