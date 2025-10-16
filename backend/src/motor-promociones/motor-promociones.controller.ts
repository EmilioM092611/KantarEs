import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MotorPromocionesService } from './motor-promociones.service';
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

@ApiTags('Motor de Promociones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('motor-promociones')
export class MotorPromocionesController {
  constructor(private readonly svc: MotorPromocionesService) {}

  @Get('orden/:id/aplicables')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Listar promociones aplicables a una orden (simulación)',
    description:
      'Motor de evaluación de promociones: analiza orden y retorna lista de promociones aplicables. Proceso: valida cada promoción vigente contra orden (productos, categorías, total), verifica restricciones (horario, días, usos), calcula descuento potencial de cada una, ordena por beneficio para cliente. Modo simulación: NO aplica promociones, solo muestra qué se puede aplicar. Incluye: descripción, descuento calculado, ahorro estimado, restricciones, si es combinable. Validaciones: vigencia, horario, día semana, productos elegibles, monto mínimo, usos disponibles. Usado en punto de venta para mostrar promociones disponibles al cliente antes de aplicar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a evaluar',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de promociones aplicables generada exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            subtotal: 450.0,
            items_count: 5,
          },
          promociones_aplicables: [
            {
              id_promocion: 25,
              nombre: 'Happy Hour Cervezas',
              descripcion: '2x1 en todas las cervezas nacionales',
              tipo: '2x1',
              aplicacion: 'categoria',
              categoria: 'Cervezas',
              descuento_calculado: 72.0,
              ahorro_cliente: 72.0,
              total_con_descuento: 378.0,
              productos_elegibles: [
                {
                  id_item: 1236,
                  producto: 'Cerveza Corona 355ml',
                  cantidad: 4,
                  precio_original: 18.0,
                  descuento_item: 36.0,
                },
                {
                  id_item: 1237,
                  producto: 'Cerveza Modelo 355ml',
                  cantidad: 4,
                  precio_original: 18.0,
                  descuento_item: 36.0,
                },
              ],
              restricciones: {
                horario: '15:00 - 19:00',
                dias: 'Lunes a Viernes',
                dentro_horario: true,
                dia_valido: true,
              },
              combinable: false,
              usos_disponibles: 955,
              prioridad: 1,
              recomendacion: 'Mejor descuento disponible',
            },
            {
              id_promocion: 22,
              nombre: '15% Descuento Total',
              descripcion: '15% de descuento en toda la cuenta',
              tipo: 'descuento_porcentaje',
              aplicacion: 'total_cuenta',
              valor: 15,
              descuento_calculado: 67.5,
              ahorro_cliente: 67.5,
              total_con_descuento: 382.5,
              restricciones: {
                monto_minimo: 300.0,
                cumple_minimo: true,
              },
              combinable: true,
              usos_disponibles: 270,
              prioridad: 2,
            },
            {
              id_promocion: 30,
              nombre: 'Combo Familiar',
              descripcion: 'Precio especial en combo de 4 hamburguesas',
              tipo: 'precio_fijo',
              aplicacion: 'combo',
              descuento_calculado: 0,
              ahorro_cliente: 0,
              motivo_no_aplicable:
                'La orden no contiene los productos del combo',
              aplicable: false,
              productos_requeridos: [
                'Hamburguesa Clásica x4',
                'Papas Fritas x4',
                'Refresco x4',
              ],
              productos_faltantes: ['Hamburguesa Clásica (necesita 2 más)'],
            },
          ],
          resumen: {
            total_promociones_vigentes: 8,
            promociones_aplicables: 2,
            promociones_no_aplicables: 1,
            mejor_descuento: {
              id_promocion: 25,
              nombre: 'Happy Hour Cervezas',
              ahorro: 72.0,
            },
          },
          recomendacion: {
            mensaje: 'Aplicar "Happy Hour Cervezas" para maximizar ahorro',
            codigo: 'HAPPYHOUR2X1',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token JWT inválido o expirado',
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
  aplicables(@Param('id', ParseIntPipe) id: number) {
    return this.svc.promosAplicablesOrden(id);
  }

  @Post('orden/:id/aplicar')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aplicar una promoción a la orden',
    description:
      'Aplica promoción específica a orden y recalcula totales. Puede aplicar por ID de promoción o por código promocional. Proceso: valida elegibilidad completa (vigencia, restricciones, productos), calcula descuento exacto según tipo (porcentaje/monto/2x1/combo), actualiza orden con descuento aplicado, recalcula subtotal y total, registra promoción aplicada, incrementa contador de usos, genera auditoría. Validaciones: promoción válida, restricciones cumplidas, no exceder máximo de usos, compatibilidad con otras promociones si ya hay alguna aplicada. Permanente: descuento se queda en orden hasta que se quite manualmente. IMPORTANTE: operación atómica, revierte si falla.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción aplicada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Promoción aplicada exitosamente',
        data: {
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            subtotal_original: 450.0,
            descuento_aplicado: 72.0,
            subtotal_con_descuento: 378.0,
            propina: 50.0,
            total: 428.0,
          },
          promocion_aplicada: {
            id_promocion: 25,
            nombre: 'Happy Hour Cervezas',
            codigo: 'HAPPYHOUR2X1',
            tipo: '2x1',
            descripcion: '2x1 en todas las cervezas nacionales',
            descuento_calculado: 72.0,
            porcentaje_descuento: 16.0,
          },
          items_afectados: [
            {
              id_item: 1236,
              producto: 'Cerveza Corona 355ml',
              cantidad: 4,
              precio_unitario_original: 18.0,
              descuento_item: 36.0,
              precio_final: 36.0,
            },
            {
              id_item: 1237,
              producto: 'Cerveza Modelo 355ml',
              cantidad: 4,
              precio_unitario_original: 18.0,
              descuento_item: 36.0,
              precio_final: 36.0,
            },
          ],
          ahorro_cliente: {
            monto: 72.0,
            porcentaje: 16.0,
          },
          aplicado_por: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Cajero',
          },
          fecha_aplicacion: '2025-10-15T20:00:00.000Z',
          promocion_uso: {
            usos_anteriores: 45,
            usos_actuales: 46,
            usos_disponibles: 954,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Promoción no aplicable o datos inválidos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'Promoción no aplicable: fuera de horario (válida 15:00-19:00)',
          'Promoción no aplicable: monto mínimo $300 no alcanzado (orden: $250)',
          'Promoción no combinable con "15% Descuento Total" ya aplicado',
        ],
        errors: {
          promocion: 'Happy Hour Cervezas',
          hora_actual: '20:30',
          horario_valido: '15:00-19:00',
        },
        timestamp: '2025-10-15T20:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Orden o promoción no encontrada',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Promoción con código "INVALIDO" no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto: promoción sin usos disponibles o ya aplicada',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'Promoción sin usos disponibles (máximo alcanzado: 1000/1000)',
          'Esta orden ya tiene aplicada esta promoción',
        ],
        data: {
          promocion: 'Happy Hour Cervezas',
          usos_actuales: 1000,
          maximo_usos: 1000,
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  aplicar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { id_promocion?: number; codigo?: string },
  ) {
    return this.svc.aplicarPromocion(id, dto);
  }

  @Post('orden/:id/aplicar-mejor')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aplicar automáticamente la mejor promoción disponible',
    description:
      'Evaluación automática inteligente: analiza todas las promociones aplicables y aplica automáticamente la que genera MAYOR ahorro para el cliente. Proceso: evalúa todas las promociones vigentes, calcula descuento de cada una, considera combinabilidad si hay promoción previa, selecciona la mejor (mayor descuento absoluto), la aplica automáticamente. Usado para "maximizar descuento" o cuando cliente no tiene código pero se quiere dar mejor beneficio automático. Estrategia: prioriza ahorro total en pesos sobre porcentajes. Si hay empate, usa criterios secundarios: vigencia más corta primero, prioridad configurada.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Mejor promoción aplicada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Mejor promoción aplicada automáticamente',
        data: {
          promocion_seleccionada: {
            id_promocion: 25,
            nombre: 'Happy Hour Cervezas',
            codigo: 'HAPPYHOUR2X1',
            razon_seleccion: 'Mayor ahorro absoluto ($72 vs $67.50)',
          },
          orden: {
            id: 456,
            subtotal_original: 450.0,
            descuento: 72.0,
            total: 428.0,
            ahorro: 72.0,
            ahorro_porcentaje: 16.0,
          },
          promociones_evaluadas: [
            {
              nombre: 'Happy Hour Cervezas',
              ahorro: 72.0,
              seleccionada: true,
            },
            {
              nombre: '15% Descuento Total',
              ahorro: 67.5,
              seleccionada: false,
            },
          ],
          comparativa: {
            mejor_opcion: 'Happy Hour Cervezas ($72)',
            segunda_opcion: '15% Descuento Total ($67.50)',
            diferencia: 4.5,
          },
          fecha_aplicacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No hay promociones aplicables',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No hay promociones aplicables para esta orden en este momento',
        ],
        data: {
          orden_subtotal: 150.0,
          productos: ['Refresco x3'],
          promociones_evaluadas: 5,
          motivos_no_aplicables: [
            'Monto mínimo no alcanzado',
            'Fuera de horario',
            'Productos no elegibles',
          ],
        },
        sugerencia: 'Agregar $150 más para acceder a "15% Descuento Total"',
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  aplicarMejor(@Param('id', ParseIntPipe) id: number) {
    return this.svc.aplicarMejor(id);
  }

  @Post('orden/:id/quitar')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quitar promoción aplicada y recalcular totales',
    description:
      'Remueve promoción previamente aplicada a orden. Proceso: identifica promoción activa en orden, revierte descuento aplicado, recalcula subtotal y total a valores originales, decrementa contador de usos de promoción (libera uso), registra remoción en auditoría. Validaciones: orden debe tener promoción aplicada, orden no puede estar pagada (no quitar promociones de órdenes cerradas). Usado para correcciones, cambios de cliente, aplicar otra promoción incompatible. IMPORTANTE: no afecta promociones en órdenes ya pagadas para mantener integridad contable.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 456,
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción removida exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Promoción removida exitosamente',
        data: {
          promocion_removida: {
            id_promocion: 25,
            nombre: 'Happy Hour Cervezas',
            codigo: 'HAPPYHOUR2X1',
            descuento_revertido: 72.0,
          },
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            subtotal_anterior: 378.0,
            subtotal_actual: 450.0,
            descuento_anterior: 72.0,
            descuento_actual: 0,
            total_anterior: 428.0,
            total_actual: 500.0,
          },
          cambio: {
            diferencia_total: 72.0,
            explicacion: 'Total aumentó en $72 al quitar la promoción',
          },
          promocion_uso: {
            usos_anteriores: 46,
            usos_actuales: 45,
            uso_liberado: true,
          },
          removido_por: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Cajero',
          },
          motivo: 'Cliente solicitó aplicar código diferente',
          fecha_remocion: '2025-10-15T20:10:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede quitar promoción',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'La orden no tiene ninguna promoción aplicada',
          'No se puede quitar promoción: orden ya está pagada',
        ],
        data: {
          orden_id: 456,
          tiene_promocion: false,
          estado_orden: 'Pagada',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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
  quitar(@Param('id', ParseIntPipe) id: number) {
    return this.svc.quitarPromocion(id);
  }
}
