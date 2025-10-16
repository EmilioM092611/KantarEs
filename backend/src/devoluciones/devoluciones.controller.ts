/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevolucionesService } from './devoluciones.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Devoluciones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('devoluciones')
export class DevolucionesController {
  constructor(private readonly svc: DevolucionesService) {}

  @Post('venta')
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Registrar devolución de venta (reintegro a inventario y ajuste de la orden)',
    description:
      'Procesa devolución de productos vendidos al cliente. Casos: producto defectuoso, pedido incorrecto, cambio de opinión, error en orden. Proceso: valida orden y items, reintegra cantidad devuelta a inventario (genera movimiento de entrada), ajusta totales de orden (descuenta monto devuelto), registra motivo de devolución, genera nota de crédito si aplica, registra usuario que autoriza. Si la orden estaba pagada, puede generar reembolso o crédito para siguiente compra. Actualiza estado de items devueltos. Requiere autorización gerencial por política. Afecta inventario, contabilidad y estadísticas de ventas. IMPORTANTE: operación debe ser reversible solo con autorización especial.',
  })
  @ApiResponse({
    status: 201,
    description: 'Devolución de venta registrada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Devolución procesada exitosamente',
        data: {
          id_devolucion: 789,
          tipo: 'devolucion_venta',
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            total_original: 600.0,
            total_actualizado: 480.0,
          },
          items_devueltos: [
            {
              id_item: 1234,
              producto: {
                id: 12,
                nombre: 'Hamburguesa Clásica',
                sku: 'FOOD-001',
              },
              cantidad_devuelta: 1,
              precio_unitario: 120.0,
              monto_devuelto: 120.0,
              motivo: 'Producto defectuoso - carne cruda',
            },
          ],
          totales: {
            subtotal_devuelto: 120.0,
            iva_devuelto: 0,
            total_devuelto: 120.0,
          },
          inventario: {
            movimientos_generados: 1,
            productos_reintegrados: [
              {
                producto: 'Hamburguesa Clásica',
                cantidad: 1,
                stock_anterior: 48,
                stock_nuevo: 49,
              },
            ],
          },
          reembolso: {
            metodo_original: 'Tarjeta Crédito',
            metodo_reembolso: 'Nota de Crédito',
            monto: 120.0,
            folio_nota_credito: 'NC-2025-045',
            valido_hasta: '2026-01-15',
          },
          autorizacion: {
            autorizado_por: 'Gerente',
            fecha_autorizacion: '2025-10-15T20:00:00.000Z',
            ip: '192.168.1.100',
          },
          observaciones:
            'Cliente reportó que carne estaba cruda. Se ofreció reposición pero cliente declinó.',
          fecha_devolucion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o devolución no permitida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede devolver: han pasado más de 24 horas desde la compra',
          'El item ya fue devuelto previamente',
          'La cantidad a devolver excede la cantidad original',
        ],
        errors: {
          orden_fecha: '2025-10-10T20:00:00.000Z',
          horas_transcurridas: 120,
          limite_politica_horas: 24,
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
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden autorizar devoluciones',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden o items no encontrados',
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
    description: 'Conflicto con estado de orden o inventario',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['La orden está cancelada y no permite devoluciones'],
        data: {
          orden_id: 456,
          estado: 'Cancelada',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  devolucionVenta(@Body() dto: any) {
    return this.svc.devolucionVenta(dto);
  }

  @Post('compra')
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Registrar devolución de compra a proveedor (salida de inventario)',
    description:
      'Procesa devolución de mercancía al proveedor. Casos: producto defectuoso recibido, cantidad incorrecta, producto caducado/dañado, no cumple especificaciones. Proceso: valida compra y productos, genera salida de inventario (movimiento de devolución), ajusta totales de compra, notifica a proveedor si está configurado, genera nota de devolución/cargo, solicita nota de crédito al proveedor, registra motivo y evidencias. Afecta cuentas por pagar si compra fue a crédito. Actualiza relación con proveedor (calificación, confiabilidad). Requiere autorización gerencial. Genera documentación para reclamación. IMPORTANTE: debe coincidir con políticas de devolución del proveedor.',
  })
  @ApiResponse({
    status: 201,
    description: 'Devolución de compra registrada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Devolución a proveedor procesada exitosamente',
        data: {
          id_devolucion: 890,
          tipo: 'devolucion_compra',
          compra: {
            id: 123,
            folio: 'COMP-2025-123',
            proveedor: {
              id: 15,
              nombre: 'Bebidas del Norte',
              rfc: 'DBN850615XYZ',
            },
            total_original: 6032.0,
            total_actualizado: 5132.0,
          },
          productos_devueltos: [
            {
              producto: {
                id: 12,
                nombre: 'Cerveza Corona 355ml',
                sku: 'BEB-001',
              },
              cantidad_devuelta: 50,
              precio_unitario: 18.0,
              monto_devuelto: 900.0,
              lote_devuelto: 'LOTE-2025-001',
              motivo: 'Producto caducado - fecha de vencimiento incorrecta',
              evidencias: ['foto_etiqueta.jpg', 'foto_producto.jpg'],
            },
          ],
          totales: {
            subtotal_devuelto: 900.0,
            iva_devuelto: 144.0,
            total_devuelto: 1044.0,
          },
          inventario: {
            movimientos_generados: 1,
            productos_dados_baja: [
              {
                producto: 'Cerveza Corona 355ml',
                cantidad: 50,
                lote: 'LOTE-2025-001',
                stock_anterior: 135,
                stock_nuevo: 85,
                disposicion: 'devolucion_proveedor',
              },
            ],
          },
          documentacion: {
            nota_devolucion: 'NDEV-2025-045',
            solicitud_nota_credito: true,
            carta_reclamacion: 'generada',
            fotos_evidencia: 2,
          },
          proveedor_notificado: {
            email_enviado: true,
            email_destinatario: 'ventas@bebidasnorte.com',
            fecha_envio: '2025-10-15T20:05:00.000Z',
          },
          autorizacion: {
            autorizado_por: 'Gerente',
            fecha_autorizacion: '2025-10-15T20:00:00.000Z',
          },
          seguimiento: {
            estatus: 'pendiente_aceptacion_proveedor',
            siguiente_accion:
              'Esperar respuesta del proveedor (5 días hábiles)',
            fecha_limite_respuesta: '2025-10-22',
          },
          impacto_relacion: {
            incidentes_previos: 2,
            calificacion_proveedor_actualizada: 4.5,
            observacion: 'Tercer incidente con productos caducados',
          },
          fecha_devolucion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o devolución no permitida',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'No se puede devolver: la compra tiene más de 30 días',
          'La cantidad a devolver excede la cantidad recibida',
          'El producto no pertenece a esta compra',
        ],
        errors: {
          compra_fecha: '2025-08-15',
          dias_transcurridos: 61,
          politica_proveedor_dias: 30,
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
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden procesar devoluciones a proveedores',
  })
  @ApiResponse({
    status: 404,
    description: 'Compra, proveedor o productos no encontrados',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Compra con ID 999 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflicto con estado de compra',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['La compra está cancelada y no permite devoluciones'],
        data: {
          compra_id: 123,
          estado: 'Cancelada',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  devolucionCompra(@Body() dto: any) {
    return this.svc.devolucionCompra(dto);
  }
}
