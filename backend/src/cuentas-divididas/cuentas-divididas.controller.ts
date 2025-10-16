/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CuentasDivididasService } from './cuentas-divididas.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Cuentas Divididas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cuentas-divididas')
export class CuentasDivididasController {
  constructor(private readonly svc: CuentasDivididasService) {}

  @Post('orden/:id')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Dividir una orden en grupos (split) y aplicar pagos mixtos',
    description:
      'Divide cuenta de mesa en múltiples partes para pago separado. Casos de uso: "dividir en partes iguales" (split N ways), "por persona" (cada quien paga lo suyo), "por items" (agrupar productos específicos). Proceso: define grupos con items asignados, calcula total por grupo, aplica métodos de pago independientes a cada grupo, genera registros de pago separados, marca items como pagados. Soporta pagos mixtos (efectivo+tarjeta) en cada grupo. Validaciones: suma de grupos = total orden, items no duplicados, cada grupo con método de pago válido. Actualiza estado de orden cuando todos los grupos están pagados. Usado frecuentemente en restaurantes cuando grupos de comensales dividen la cuenta. IMPORTANTE: operación atómica, si falla algún pago se revierten todos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a dividir',
    example: 456,
  })
  @ApiResponse({
    status: 201,
    description: 'Cuenta dividida y pagos procesados exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Cuenta dividida y pagada exitosamente',
        data: {
          id_orden: 456,
          numero_orden: 'ORD-2025-456',
          total_orden: 600.0,
          tipo_division: 'por_items',
          grupos_creados: 3,
          grupos: [
            {
              id_grupo: 1,
              nombre: 'Grupo 1 - Juan',
              items: [
                {
                  id_item: 1234,
                  producto: 'Hamburguesa Clásica',
                  cantidad: 1,
                  precio: 120.0,
                },
                {
                  id_item: 1235,
                  producto: 'Papas Fritas',
                  cantidad: 1,
                  precio: 40.0,
                },
                {
                  id_item: 1236,
                  producto: 'Refresco',
                  cantidad: 1,
                  precio: 20.0,
                },
              ],
              subtotal: 180.0,
              pagos_aplicados: [
                {
                  metodo: 'Efectivo',
                  monto: 180.0,
                  id_pago: 1001,
                },
              ],
              total_pagado: 180.0,
              estatus: 'pagado',
            },
            {
              id_grupo: 2,
              nombre: 'Grupo 2 - María',
              items: [
                {
                  id_item: 1237,
                  producto: 'Pizza Pepperoni',
                  cantidad: 1,
                  precio: 180.0,
                },
              ],
              subtotal: 180.0,
              pagos_aplicados: [
                {
                  metodo: 'Tarjeta Crédito',
                  monto: 180.0,
                  referencia: 'AUTH-78945',
                  id_pago: 1002,
                },
              ],
              total_pagado: 180.0,
              estatus: 'pagado',
            },
            {
              id_grupo: 3,
              nombre: 'Grupo 3 - Carlos',
              items: [
                {
                  id_item: 1238,
                  producto: 'Tacos al Pastor (3)',
                  cantidad: 1,
                  precio: 150.0,
                },
                {
                  id_item: 1239,
                  producto: 'Agua',
                  cantidad: 1,
                  precio: 15.0,
                },
              ],
              subtotal: 165.0,
              pagos_aplicados: [
                {
                  metodo: 'Efectivo',
                  monto: 100.0,
                  id_pago: 1003,
                },
                {
                  metodo: 'Tarjeta Débito',
                  monto: 65.0,
                  referencia: 'AUTH-12378',
                  id_pago: 1004,
                },
              ],
              total_pagado: 165.0,
              estatus: 'pagado',
            },
          ],
          resumen: {
            total_orden: 600.0,
            total_cobrado: 525.0,
            propina_incluida: 75.0,
            total_con_propina: 600.0,
            todos_grupos_pagados: true,
          },
          orden: {
            estado_anterior: 'Servida',
            estado_nuevo: 'Pagada',
            fecha_pago: '2025-10-15T20:00:00.000Z',
          },
          pagos_generados: 4,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o división no válida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'La suma de los grupos ($550) no coincide con el total de la orden ($600)',
          'El item ID 1234 está duplicado en múltiples grupos',
          'La orden debe estar en estado "Servida" para dividirse',
        ],
        errors: {
          total_orden: 600.0,
          suma_grupos: 550.0,
          diferencia: -50.0,
          items_duplicados: [1234],
        },
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
    description: 'Permiso denegado - Rol insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Orden con ID 999 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: orden ya pagada o en proceso de pago',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['La orden ya está pagada completamente'],
        data: {
          orden_id: 456,
          estado: 'Pagada',
          total: 600.0,
          pagado: 600.0,
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al procesar pago de algún grupo - operación revertida',
    schema: {
      example: {
        success: false,
        code: 500,
        message: ['Error al procesar pago del Grupo 2: tarjeta declinada'],
        errors: {
          grupo_fallido: 2,
          metodo_pago: 'Tarjeta Crédito',
          razon: 'Fondos insuficientes',
          grupos_revertidos: [1],
        },
        data: {
          operacion: 'revertida',
          mensaje: 'Ningún pago fue procesado. Intente nuevamente.',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  splitOrden(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.svc.splitOrden(id, dto);
  }
}
