// src/cfdi/cfdi.controller.ts
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

// ✅ FASE 7: DTOs de relaciones
import { CrearNotaCreditoDto } from './dto/crear-nota-credito.dto';
import { CrearComplementoPagoDto } from './dto/crear-complemento-pago.dto';

@ApiTags('CFDI - Facturación Electrónica')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cfdi')
export class CfdiController {
  constructor(private readonly svc: CfdiService) {}

  // ======================================================================
  // RECEPTORES (Fase 1-4)
  // ======================================================================

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
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  crearReceptor(@Body() dto: CreateReceptorDto) {
    return this.svc.crearReceptor(dto);
  }

  @Get('receptores')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Buscar receptores',
    description:
      'Busca por RFC (exacto o parcial) o razón social (búsqueda textual). Retorna lista de receptores activos con datos fiscales. Usado en punto de venta al momento de facturar para encontrar datos del cliente. Si no se proporciona query, retorna últimos 50 receptores.',
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
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  buscarReceptores(@Query('q') q?: string) {
    return this.svc.buscarReceptores(q);
  }

  // ======================================================================
  // TIMBRADO (Fase 1-4 + validación Fase 5)
  // ======================================================================

  @Post('facturar/orden/:id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Generar y timbrar CFDI para una orden',
    description:
      'Genera factura electrónica (CFDI 4.0) para una orden pagada y la envía a timbrar con el PAC. Proceso: valida orden esté pagada, obtiene datos del receptor, construye XML con conceptos de la orden, valida XML contra esquemas SAT (Fase 5), envía a PAC para timbrado, almacena XML/PDF timbrado, genera UUID único, actualiza estado de orden. Incluye datos del emisor (restaurant), receptor (cliente), conceptos (items de orden), impuestos (IVA), totales, forma de pago. IRREVERSIBLE una vez timbrado. Para errores, debe cancelarse y re-facturar. Envía email al cliente con archivos. Cumple con requisitos SAT México.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden a facturar',
    example: 456,
  })
  @ApiResponse({
    status: 201,
    description: 'CFDI generado y timbrado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación XML o al timbrar',
    schema: {
      example: {
        success: false,
        message: 'XML inválido según validación XSD del SAT',
        errors: [
          'RFC receptor inválido: XYZ',
          'El subtotal no puede ser negativo',
        ],
        warnings: ['Moneda inusual: USD'],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Orden o receptor no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al conectar con el PAC' })
  facturarOrden(
    @Param('id', ParseIntPipe) id_orden: number,
    @Body() dto: FacturarOrdenDto,
  ) {
    return this.svc.facturarOrden(id_orden, dto);
  }

  // ======================================================================
  // CANCELACIÓN (Fase 1-4)
  // ======================================================================

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
  })
  @ApiResponse({
    status: 400,
    description: 'CFDI no se puede cancelar',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'CFDI no encontrado' })
  @ApiResponse({ status: 500, description: 'Error al cancelar con el PAC/SAT' })
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
  })
  @ApiResponse({
    status: 400,
    description: 'UUID inválido o CFDI no se puede cancelar',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'No se encontró CFDI con ese UUID' })
  cancelarPorUuid(@Param('uuid') uuid: string, @Body() dto: CancelarCfdiDto) {
    return this.svc.cancelarUuid(uuid, dto);
  }

  // ======================================================================
  // LISTADO Y DESCARGAS (Fase 1-4)
  // ======================================================================

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
  })
  @ApiResponse({
    status: 404,
    description: 'CFDI no encontrado o no tiene XML disponible',
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
  })
  @ApiResponse({
    status: 404,
    description:
      'CFDI no encontrado, no está cancelado o no tiene acuse disponible',
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

  // ======================================================================
  // ✅ FASE 7: RELACIÓN DE CFDIS
  // ======================================================================

  @Post('nota-credito')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Crear nota de crédito (CFDI tipo Egreso)',
    description: `
      Genera una nota de crédito relacionada a un CFDI de ingreso existente.
      
      **Casos de uso:**
      - Devoluciones de mercancía
      - Descuentos posteriores a la emisión
      - Bonificaciones
      - Corrección de errores en facturación
      
      **Tipos de relación (catálogo SAT):**
      - 01: Nota de crédito de los documentos relacionados
      - 03: Devolución de mercancía sobre facturas previas
      
      **Proceso:**
      1. Valida que el CFDI original exista y esté timbrado
      2. Valida que el receptor sea el mismo
      3. Genera XML con relación al CFDI original (con validación XSD Fase 5)
      4. Crea registro pendiente de timbrado
      5. Usar POST /cfdi/:id/timbrar-relacionado para enviar al PAC
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Nota de crédito creada exitosamente (pendiente de timbrado)',
    schema: {
      example: {
        ok: true,
        id_cfdi: 150,
        tipo: 'E',
        mensaje: 'Nota de crédito creada. Pendiente de timbrado.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación o datos incorrectos',
  })
  @ApiResponse({
    status: 404,
    description: 'CFDI original no encontrado',
  })
  crearNotaCredito(@Body() dto: CrearNotaCreditoDto) {
    return this.svc.crearNotaCredito(dto);
  }

  @Post('complemento-pago')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Crear complemento de pago (CFDI tipo Pago)',
    description: `
      Genera un complemento de pago para documentar pagos parciales o totales
      de facturas emitidas previamente.
      
      **Casos de uso:**
      - Pagos en parcialidades
      - Documentar pagos en diferido
      - Registro de pagos posteriores a la factura
      
      **Requisitos:**
      - Los CFDIs originales deben estar timbrados
      - La suma de pagos no puede exceder el total facturado
      - Debe especificarse forma de pago válida del SAT
      
      **Proceso:**
      1. Valida que los CFDIs relacionados existan
      2. Calcula saldos pendientes
      3. Genera XML de complemento de pago (con validación XSD Fase 5)
      4. Crea registro pendiente de timbrado
      5. Usar POST /cfdi/:id/timbrar-relacionado para enviar al PAC
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Complemento de pago creado exitosamente',
    schema: {
      example: {
        ok: true,
        id_cfdi: 151,
        tipo: 'P',
        mensaje: 'Complemento de pago creado. Pendiente de timbrado.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Error de validación o documentos inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'CFDI(s) relacionado(s) no encontrado(s)',
  })
  crearComplementoPago(@Body() dto: CrearComplementoPagoDto) {
    return this.svc.crearComplementoPago(dto);
  }

  @Post(':id/timbrar-relacionado')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Timbrar nota de crédito o complemento de pago',
    description: `
      Envía al PAC un CFDI relacionado (nota de crédito o complemento de pago)
      que fue creado previamente y está pendiente de timbrado.
      
      **Proceso:**
      1. Valida que el CFDI exista y esté pendiente
      2. Valida XML contra esquemas SAT (Fase 5)
      3. Envía XML al PAC para timbrado
      4. Almacena UUID y XML timbrado
      5. Actualiza estado a 'timbrado'
      
      **Importante:** Este endpoint es específico para CFDIs tipo E (Egreso)
      y P (Pago). Para facturas normales usar POST /cfdi/facturar/orden/:id
    `,
  })
  @ApiParam({
    name: 'id',
    description:
      'ID del CFDI relacionado (nota de crédito o complemento de pago)',
    example: 150,
  })
  @ApiResponse({
    status: 200,
    description: 'CFDI relacionado timbrado exitosamente',
    schema: {
      example: {
        ok: true,
        id_cfdi: 150,
        uuid: '87654321-4321-4321-4321-210987654321',
        tipo: 'E',
        mensaje: 'Nota de crédito timbrada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'CFDI no pendiente, XML inválido o error en timbrado',
  })
  @ApiResponse({
    status: 404,
    description: 'CFDI no encontrado',
  })
  timbrarRelacionado(@Param('id', ParseIntPipe) id: number) {
    return this.svc.timbrarRelacionado(id);
  }

  @Get('relacionados/:uuid')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener CFDIs relacionados a un UUID',
    description: `
      Consulta todos los CFDIs que están relacionados con un UUID específico.
      
      **Retorna:**
      - El CFDI original
      - Lista de notas de crédito relacionadas
      - Lista de complementos de pago relacionados
      - Tipo de relación de cada CFDI
      
      **Útil para:**
      - Ver historial completo de un CFDI
      - Auditoría de documentos relacionados
      - Validar devoluciones y pagos
    `,
  })
  @ApiParam({
    name: 'uuid',
    description: 'UUID del CFDI original',
    example: '12345678-1234-1234-1234-123456789ABC',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de CFDIs relacionados',
    schema: {
      example: {
        cfdi_original: {
          id_cfdi: 145,
          uuid: '12345678-1234-1234-1234-123456789ABC',
          tipo: 'I',
          total: 1000.0,
          estatus: 'timbrado',
          fecha_timbrado: '2025-10-15T10:00:00.000Z',
          receptor: {
            rfc: 'XAXX010101000',
            razon_social: 'Juan Pérez García',
          },
        },
        cfdis_relacionados: [
          {
            id_cfdi: 150,
            uuid: '87654321-4321-4321-4321-210987654321',
            tipo: 'E',
            tipo_relacion: '01',
            total: 200.0,
            estatus: 'timbrado',
            fecha_timbrado: '2025-10-16T14:30:00.000Z',
            receptor: {
              rfc: 'XAXX010101000',
              razon_social: 'Juan Pérez García',
            },
          },
        ],
        total_relacionados: 1,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'UUID no encontrado',
  })
  obtenerRelacionados(@Param('uuid') uuid: string) {
    return this.svc.obtenerRelacionados(uuid);
  }
}
