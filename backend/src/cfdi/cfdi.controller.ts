import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Header,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import express from 'express';

import { CfdiService } from './cfdi.service';
import { CreateReceptorDto } from './dto/create-receptor.dto';
import { FacturarOrdenDto } from './dto/facturar-orden.dto';
import { CancelarCfdiDto } from './dto/cancelar-cfdi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('CFDI - Facturación Electrónica')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cfdi')
export class CfdiController {
  constructor(private readonly svc: CfdiService) {}

  // ------ Receptores ------
  @Post('receptores')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Crear receptor (datos fiscales del cliente)',
    description:
      'Registra datos fiscales de cliente para facturación electrónica. Incluye RFC, razón social/nombre, régimen fiscal, código postal, dirección fiscal completa, uso de CFDI, email para envío de facturas. Valida formato de RFC (12 o 13 caracteres). Usado al registrar clientes que solicitan factura. Los receptores se reutilizan en múltiples facturas. CRÍTICO: datos deben ser exactos para validación del SAT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Receptor creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Receptor registrado exitosamente',
        data: {
          id_receptor: 45,
          rfc: 'XAXX010101000',
          razon_social: 'Juan Pérez García',
          nombre_comercial: null,
          regimen_fiscal: '612',
          codigo_postal: '76120',
          uso_cfdi: 'G03',
          email: 'juan.perez@email.com',
          direccion: {
            calle: 'Av. Principal 123',
            colonia: 'Centro',
            municipio: 'Querétaro',
            estado: 'Querétaro',
            pais: 'México',
          },
          activo: true,
          fecha_registro: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o RFC con formato incorrecto',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'RFC debe tener 12 o 13 caracteres',
          'Código postal debe tener 5 dígitos',
        ],
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
    status: 409,
    description: 'Ya existe un receptor con ese RFC',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'Ya existe un receptor registrado con el RFC "XAXX010101000"',
        ],
        data: {
          receptor_existente: {
            id: 30,
            razon_social: 'Juan Pérez García',
          },
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  crearReceptor(@Body() dto: CreateReceptorDto) {
    return this.svc.crearReceptor(dto);
  }

  @Get('receptores')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Buscar receptores por RFC/razón social',
    description:
      'Búsqueda de receptores registrados para selección rápida al facturar. Busca por RFC (exacto o parcial) o razón social (búsqueda textual). Retorna lista de receptores activos con datos fiscales. Usado en punto de venta al momento de facturar para encontrar datos del cliente. Si no se proporciona query, retorna últimos 50 receptores.',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description:
      'Término de búsqueda: RFC (parcial/completo) o razón social (búsqueda textual case-insensitive)',
    example: 'XAXX',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de receptores encontrados',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_receptor: 45,
            rfc: 'XAXX010101000',
            razon_social: 'Juan Pérez García',
            regimen_fiscal: '612',
            uso_cfdi: 'G03',
            email: 'juan.perez@email.com',
            codigo_postal: '76120',
          },
          {
            id_receptor: 38,
            rfc: 'XAXX010101AAA',
            razon_social: 'María González López',
            regimen_fiscal: '612',
            uso_cfdi: 'G01',
            email: 'maria.gonzalez@email.com',
            codigo_postal: '76100',
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  buscarReceptores(@Query('q') q?: string) {
    return this.svc.buscarReceptores(q);
  }

  // ------ Timbrado ------
  @Post('facturar/orden/:id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Generar y timbrar CFDI para una orden',
    description:
      'Genera factura electrónica (CFDI 4.0) para una orden pagada y la envía a timbrar con el PAC. Proceso: valida orden esté pagada, obtiene datos del receptor, construye XML con conceptos de la orden, envía a PAC para timbrado, almacena XML/PDF timbrado, genera UUID único, actualiza estado de orden. Incluye datos del emisor (restaurant), receptor (cliente), conceptos (items de orden), impuestos (IVA), totales, forma de pago. IRREVERSIBLE una vez timbrado. Para errores, debe cancelarse y re-facturar. Envía email al cliente con archivos. Cumple con requisitos SAT México.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a facturar',
    example: 456,
  })
  @ApiResponse({
    status: 201,
    description: 'CFDI generado y timbrado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Factura generada y timbrada exitosamente',
        data: {
          id_cfdi: 789,
          uuid: '12345678-1234-1234-1234-123456789ABC',
          folio_fiscal: 'F-2025-789',
          orden: {
            id: 456,
            numero: 'ORD-2025-456',
            total: 580.0,
          },
          receptor: {
            rfc: 'XAXX010101000',
            razon_social: 'Juan Pérez García',
          },
          emisor: {
            rfc: 'RES123456ABC',
            razon_social: 'Restaurant La Cocina S.A. de C.V.',
          },
          totales: {
            subtotal: 500.0,
            iva: 80.0,
            total: 580.0,
          },
          conceptos_count: 5,
          estatus: 'timbrado',
          fecha_timbrado: '2025-10-15T20:00:00.000Z',
          pac: 'Proveedor de Certificación XYZ',
          archivos: {
            xml: 'disponible',
            pdf: 'disponible',
          },
          email_enviado: true,
          fecha_certificacion_sat: '2025-10-15T20:00:15.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Orden no válida para facturar o datos incompletos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'La orden debe estar completamente pagada para facturar',
          'La orden ya tiene una factura timbrada asociada',
        ],
        data: {
          orden_id: 456,
          total: 580.0,
          pagado: 300.0,
          saldo_pendiente: 280.0,
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Rol insuficiente',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden o receptor no encontrado',
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
    status: 500,
    description: 'Error al timbrar con el PAC',
    schema: {
      example: {
        success: false,
        code: 500,
        message: ['Error al conectar con el PAC: timeout'],
        errors: {
          pac: 'Proveedor de Certificación XYZ',
          codigo_error: 'PAC_TIMEOUT',
          detalle:
            'No se recibió respuesta del servicio de timbrado en 30 segundos',
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  facturarOrden(
    @Param('id', ParseIntPipe) id_orden: number,
    @Body() dto: FacturarOrdenDto,
  ) {
    return this.svc.facturarOrden(id_orden, dto);
  }

  // ------ Cancelación ------
  @Post('cancelar/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cancelar CFDI por id_cfdi',
    description:
      'Cancela factura electrónica timbrada enviando solicitud de cancelación al SAT vía PAC. Requiere motivo de cancelación (01-04) y UUID de sustitución si aplica. Proceso: valida CFDI esté timbrado, envía solicitud al PAC, obtiene acuse de cancelación, actualiza estado. Una vez cancelado, genera nota de crédito si procede. El cliente debe aceptar cancelación si la factura tiene más de 24 horas. Cumple con lineamientos SAT. IRREVERSIBLE. Motivos: 01-Comprobante emitido con errores con relación, 02-Comprobante emitido con errores sin relación, 03-No se llevó a cabo la operación, 04-Operación nominativa relacionada en una factura global.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del CFDI a cancelar',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'CFDI cancelado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Factura cancelada exitosamente',
        data: {
          id_cfdi: 789,
          uuid: '12345678-1234-1234-1234-123456789ABC',
          folio_fiscal: 'F-2025-789',
          estatus_anterior: 'timbrado',
          estatus_nuevo: 'cancelado',
          motivo_cancelacion: '02',
          descripcion_motivo: 'Comprobante emitido con errores sin relación',
          fecha_cancelacion: '2025-10-16T10:00:00.000Z',
          cancelado_por: 'Gerente',
          acuse_cancelacion: 'disponible',
          fecha_acuse_sat: '2025-10-16T10:00:15.000Z',
          requirio_aceptacion_cliente: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'CFDI no se puede cancelar',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'El CFDI ya está cancelado',
          'No se puede cancelar: debe proporcionar UUID de sustitución (motivo 01)',
        ],
        timestamp: '2025-10-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden cancelar facturas',
  })
  @ApiResponse({
    status: 404,
    description: 'CFDI no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['CFDI con ID 999 no encontrado'],
        timestamp: '2025-10-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error al cancelar con el PAC/SAT',
    schema: {
      example: {
        success: false,
        code: 500,
        message: ['Error al cancelar CFDI con el SAT'],
        errors: {
          codigo_sat: '305',
          descripcion:
            'El certificado con el que se generó el comprobante está revocado',
        },
        timestamp: '2025-10-16T10:00:00.000Z',
      },
    },
  })
  cancelarPorId(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelarCfdiDto,
  ) {
    return this.svc.cancelarPorId(id, dto);
  }

  @Post('cancelar/uuid/:uuid')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Cancelar CFDI por UUID',
    description:
      'Cancela factura electrónica usando UUID (Folio Fiscal) en lugar de ID interno. Mismo proceso que cancelación por ID. Útil cuando se tiene el UUID del comprobante pero no el ID de base de datos. El UUID es el identificador único asignado por el SAT al timbrar.',
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID (Folio Fiscal) del CFDI a cancelar',
    example: '12345678-1234-1234-1234-123456789ABC',
  })
  @ApiResponse({
    status: 200,
    description: 'CFDI cancelado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Factura cancelada exitosamente',
        data: {
          uuid: '12345678-1234-1234-1234-123456789ABC',
          folio_fiscal: 'F-2025-789',
          estatus: 'cancelado',
          fecha_cancelacion: '2025-10-16T10:00:00.000Z',
          acuse_disponible: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido o CFDI no se puede cancelar',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El formato del UUID no es válido'],
        timestamp: '2025-10-16T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador y Gerente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró CFDI con ese UUID',
    schema: {
      example: {
        success: false,
        code: 404,
        message: [
          'No se encontró CFDI con UUID "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"',
        ],
        timestamp: '2025-10-16T10:00:00.000Z',
      },
    },
  })
  cancelarPorUuid(@Param('uuid') uuid: string, @Body() dto: CancelarCfdiDto) {
    return this.svc.cancelarUuid(uuid, dto);
  }

  // ------ Listado y descargas ------
  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Listar CFDIs con filtros (estado, rfc, uuid)',
    description:
      'Lista facturas electrónicas generadas con filtros múltiples: por estado (pendiente/timbrado/cancelado/error), RFC del receptor, UUID específico, rango de fechas. Incluye datos de orden asociada, receptor, totales, estado de timbrado. Usado para consultas de facturas, reportes fiscales, búsqueda de comprobantes.',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado del CFDI',
    enum: ['pendiente', 'timbrado', 'cancelado', 'error'],
    example: 'timbrado',
  })
  @ApiQuery({
    name: 'rfc',
    required: false,
    description: 'Filtrar por RFC del receptor',
    example: 'XAXX010101000',
  })
  @ApiQuery({
    name: 'uuid',
    required: false,
    description: 'Buscar por UUID específico',
    example: '12345678-1234-1234-1234-123456789ABC',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de CFDIs obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_cfdi: 789,
            uuid: '12345678-1234-1234-1234-123456789ABC',
            folio_fiscal: 'F-2025-789',
            orden: { id: 456, numero: 'ORD-2025-456' },
            receptor: {
              rfc: 'XAXX010101000',
              razon_social: 'Juan Pérez García',
            },
            total: 580.0,
            estatus: 'timbrado',
            fecha_timbrado: '2025-10-15T20:00:00.000Z',
            fecha_certificacion: '2025-10-15T20:00:15.000Z',
          },
          {
            id_cfdi: 788,
            uuid: '87654321-4321-4321-4321-CBA987654321',
            folio_fiscal: 'F-2025-788',
            orden: { id: 455, numero: 'ORD-2025-455' },
            receptor: {
              rfc: 'XAXX010101AAA',
              razon_social: 'María González López',
            },
            total: 340.0,
            estatus: 'timbrado',
            fecha_timbrado: '2025-10-14T18:30:00.000Z',
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  listar(
    @Query('estado') estado?: 'pendiente' | 'timbrado' | 'cancelado' | 'error',
    @Query('rfc') rfc?: string,
    @Query('uuid') uuid?: string,
  ) {
    const where: any = {};
    if (estado) where.estatus = estado;
    if (uuid) where.uuid = uuid;
    if (rfc) where.cfdi_receptores = { rfc };
    return this.svc.listar(where);
  }

  @Get(':id/xml')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Descargar XML timbrado',
    description:
      'Descarga archivo XML timbrado del CFDI. El XML contiene: sello digital del SAT, sello digital del emisor, cadena original, datos fiscales completos, UUID. Archivo requerido para declaraciones fiscales. Formato válido para subir al buzón tributario del SAT. Se descarga como archivo adjunto con nombre basado en UUID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del CFDI',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'XML descargado exitosamente',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido del archivo',
        schema: { type: 'string', example: 'application/xml; charset=utf-8' },
      },
      'Content-Disposition': {
        description: 'Disposición del contenido como archivo adjunto',
        schema: {
          type: 'string',
          example:
            'attachment; filename="12345678-1234-1234-1234-123456789ABC.xml"',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'CFDI no encontrado o no tiene XML disponible',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['CFDI con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async descargarXml(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: express.Response,
  ) {
    const { xml, uuid } = await this.svc.getXml(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${uuid || 'cfdi'}.xml"`,
    );
    res.send(xml ?? '');
  }

  @Get(':id/acuse')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Descargar acuse de cancelación (si existe)',
    description:
      'Descarga archivo XML del acuse de cancelación emitido por el SAT. Solo disponible si el CFDI fue cancelado. Contiene: sello digital del SAT confirmando cancelación, fecha/hora de cancelación, estatus de aceptación. Documento oficial de la cancelación. Requerido para demostrar cancelación válida ante autoridades. Se descarga como archivo adjunto con prefijo "acuse-".',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del CFDI',
    example: 789,
  })
  @ApiResponse({
    status: 200,
    description: 'Acuse descargado exitosamente',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido del archivo',
        schema: { type: 'string', example: 'application/xml; charset=utf-8' },
      },
      'Content-Disposition': {
        description: 'Disposición del contenido',
        schema: {
          type: 'string',
          example:
            'attachment; filename="acuse-12345678-1234-1234-1234-123456789ABC.xml"',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'CFDI no encontrado, no está cancelado o no tiene acuse disponible',
    schema: {
      example: {
        success: false,
        code: 404,
        message: [
          'El CFDI no tiene acuse de cancelación disponible (no está cancelado)',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden descargar acuses',
  })
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async descargarAcuse(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: express.Response,
  ) {
    const { acuse, uuid } = await this.svc.getAcuse(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="acuse-${uuid || id}.xml"`,
    );
    res.send(acuse ?? '');
  }
}
