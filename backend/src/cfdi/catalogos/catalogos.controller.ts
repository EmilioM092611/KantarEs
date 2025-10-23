// backend/src/cfdi/catalogos/catalogos.controller.ts

import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('CFDI - Catálogos SAT')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cfdi/catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  // ============================================
  // REGÍMENES FISCALES
  // ============================================

  @Get('regimenes-fiscales')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener catálogo de regímenes fiscales',
    description:
      'Lista completa de regímenes fiscales del SAT según catálogo c_RegimenFiscal. Indica si aplica para persona física o moral. Usado al registrar emisores o receptores. Ejemplos: 601-General de Ley PM, 612-PF con actividades empresariales, 621-Régimen de Incorporación Fiscal.',
  })
  @ApiQuery({
    name: 'vigentes',
    required: false,
    description: 'Filtrar solo regímenes vigentes',
    example: true,
    type: Boolean,
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de persona',
    enum: ['fisica', 'moral'],
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de regímenes fiscales',
    schema: {
      example: {
        success: true,
        data: [
          {
            clave: '601',
            descripcion: 'General de Ley Personas Morales',
            fisica: false,
            moral: true,
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
          {
            clave: '612',
            descripcion:
              'Personas Físicas con Actividades Empresariales y Profesionales',
            fisica: true,
            moral: false,
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
        ],
        total: 2,
      },
    },
  })
  getRegimenesFiscales(
    @Query('vigentes') vigentes?: boolean,
    @Query('tipo') tipo?: 'fisica' | 'moral',
  ) {
    let data;

    if (tipo === 'fisica') {
      data = this.catalogosService.getRegimenesFisicasFiscales();
    } else if (tipo === 'moral') {
      data = this.catalogosService.getRegimenesMoralesFiscales();
    } else {
      data = this.catalogosService.getRegimenesFiscales(vigentes !== false);
    }

    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get('regimenes-fiscales/:clave')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener régimen fiscal por clave',
    description: 'Busca un régimen fiscal específico por su clave del SAT.',
  })
  @ApiParam({
    name: 'clave',
    description: 'Clave del régimen fiscal (3 dígitos)',
    example: '612',
  })
  @ApiResponse({
    status: 200,
    description: 'Régimen fiscal encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Régimen fiscal no encontrado',
  })
  getRegimenFiscal(@Param('clave') clave: string) {
    const data = this.catalogosService.getRegimenFiscal(clave);
    return {
      success: true,
      data,
    };
  }

  // ============================================
  // USO DE CFDI
  // ============================================

  @Get('uso-cfdi')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener catálogo de uso de CFDI',
    description:
      'Lista completa de usos de CFDI según catálogo c_UsoCFDI del SAT. Define el propósito fiscal de la factura. Ejemplos: G01-Adquisición de mercancías, G03-Gastos en general, I01-Construcciones, D01-Honorarios médicos. Necesario al facturar para indicar qué hará el receptor con el comprobante.',
  })
  @ApiQuery({
    name: 'vigentes',
    required: false,
    description: 'Filtrar solo usos vigentes',
    example: true,
    type: Boolean,
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de persona',
    enum: ['fisica', 'moral'],
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de usos de CFDI',
    schema: {
      example: {
        success: true,
        data: [
          {
            clave: 'G01',
            descripcion: 'Adquisición de mercancías',
            fisica: true,
            moral: true,
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
          {
            clave: 'G03',
            descripcion: 'Gastos en general',
            fisica: true,
            moral: true,
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
        ],
        total: 2,
      },
    },
  })
  getUsosCfdi(
    @Query('vigentes') vigentes?: boolean,
    @Query('tipo') tipo?: 'fisica' | 'moral',
  ) {
    let data;

    if (tipo === 'fisica') {
      data = this.catalogosService.getUsosCfdiFisicas();
    } else if (tipo === 'moral') {
      data = this.catalogosService.getUsosCfdiMorales();
    } else {
      data = this.catalogosService.getUsosCfdi(vigentes !== false);
    }

    return {
      success: true,
      data,
      total: data.length,
    };
  }

  @Get('uso-cfdi/:clave')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener uso de CFDI por clave',
    description: 'Busca un uso de CFDI específico por su clave del SAT.',
  })
  @ApiParam({
    name: 'clave',
    description: 'Clave del uso de CFDI',
    example: 'G03',
  })
  @ApiResponse({
    status: 200,
    description: 'Uso de CFDI encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Uso de CFDI no encontrado',
  })
  getUsoCfdi(@Param('clave') clave: string) {
    const data = this.catalogosService.getUsoCfdi(clave);
    return {
      success: true,
      data,
    };
  }

  // ============================================
  // FORMAS DE PAGO
  // ============================================

  @Get('formas-pago')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener catálogo de formas de pago',
    description:
      'Lista completa de formas de pago según catálogo c_FormaPago del SAT. Indica el medio por el cual se realiza o realizará el pago. Ejemplos: 01-Efectivo, 02-Cheque, 03-Transferencia, 04-Tarjeta de crédito, 28-Tarjeta de débito. Usado en el CFDI para especificar cómo pagó el cliente.',
  })
  @ApiQuery({
    name: 'vigentes',
    required: false,
    description: 'Filtrar solo formas vigentes',
    example: true,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de formas de pago',
    schema: {
      example: {
        success: true,
        data: [
          {
            clave: '01',
            descripcion: 'Efectivo',
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
          {
            clave: '03',
            descripcion: 'Transferencia electrónica de fondos',
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
        ],
        total: 2,
      },
    },
  })
  getFormasPago(@Query('vigentes') vigentes?: boolean) {
    const data = this.catalogosService.getFormasPago(vigentes !== false);
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  // ============================================
  // MÉTODOS DE PAGO
  // ============================================

  @Get('metodos-pago')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener catálogo de métodos de pago',
    description:
      'Lista de métodos de pago según catálogo c_MetodoPago del SAT. Define si el pago es de contado o a crédito. Solo 2 opciones: PUE (Pago en una sola exhibición) o PPD (Pago en parcialidades o diferido). PUE es para pagos de contado, PPD para pagos a plazos que requieren complemento de pago.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de métodos de pago',
    schema: {
      example: {
        success: true,
        data: [
          {
            clave: 'PUE',
            descripcion: 'Pago en una sola exhibición',
          },
          {
            clave: 'PPD',
            descripcion: 'Pago en parcialidades o diferido',
          },
        ],
        total: 2,
      },
    },
  })
  getMetodosPago() {
    const data = this.catalogosService.getMetodosPago();
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  // ============================================
  // TIPO DE COMPROBANTE
  // ============================================

  @Get('tipos-comprobante')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener catálogo de tipos de comprobante',
    description:
      'Lista de tipos de comprobante según catálogo c_TipoDeComprobante del SAT. Opciones: I-Ingreso (factura de venta), E-Egreso (nota de crédito), T-Traslado (carta porte), N-Nómina (recibo de nómina), P-Pago (complemento de pago). Principalmente se usa I para facturas normales de venta.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de tipos de comprobante',
    schema: {
      example: {
        success: true,
        data: [
          {
            clave: 'I',
            descripcion: 'Ingreso',
          },
          {
            clave: 'E',
            descripcion: 'Egreso',
          },
          {
            clave: 'P',
            descripcion: 'Pago',
          },
        ],
        total: 3,
      },
    },
  })
  getTiposComprobante() {
    const data = this.catalogosService.getTiposComprobante();
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  // ============================================
  // MONEDAS
  // ============================================

  @Get('monedas')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener catálogo de monedas',
    description:
      'Lista completa de monedas según catálogo c_Moneda del SAT. Incluye todas las monedas aceptadas para facturación. Ejemplos: MXN-Peso Mexicano, USD-Dólar estadounidense, EUR-Euro. Para México siempre es MXN, otras monedas solo si es operación en moneda extranjera.',
  })
  @ApiQuery({
    name: 'vigentes',
    required: false,
    description: 'Filtrar solo monedas vigentes',
    example: true,
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de monedas',
    schema: {
      example: {
        success: true,
        data: [
          {
            clave: 'MXN',
            descripcion: 'Peso Mexicano',
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
          {
            clave: 'USD',
            descripcion: 'Dólar estadounidense',
            vigencia_desde: '2017-01-01',
            vigencia_hasta: null,
          },
        ],
        total: 2,
      },
    },
  })
  getMonedas(@Query('vigentes') vigentes?: boolean) {
    const data = this.catalogosService.getMonedas(vigentes !== false);
    return {
      success: true,
      data,
      total: data.length,
    };
  }

  // ============================================
  // BÚSQUEDA
  // ============================================

  @Get('buscar/:catalogo')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Buscar en un catálogo',
    description:
      'Búsqueda de texto libre en cualquier catálogo del SAT. Busca en clave y descripción. Útil para autocomplete en formularios. Ejemplo: buscar "general" en regímenes retorna régimen 601. Búsqueda case-insensitive.',
  })
  @ApiParam({
    name: 'catalogo',
    description: 'Nombre del catálogo',
    enum: [
      'regimen',
      'uso',
      'forma_pago',
      'metodo_pago',
      'tipo_comprobante',
      'moneda',
    ],
    example: 'regimen',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Texto a buscar',
    example: 'general',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de la búsqueda',
  })
  buscar(
    @Param('catalogo')
    catalogo:
      | 'regimen'
      | 'uso'
      | 'forma_pago'
      | 'metodo_pago'
      | 'tipo_comprobante'
      | 'moneda',
    @Query('q') busqueda: string,
  ) {
    const data = this.catalogosService.buscarEnCatalogo(catalogo, busqueda);
    return {
      success: true,
      data,
      total: data.length,
    };
  }
}
