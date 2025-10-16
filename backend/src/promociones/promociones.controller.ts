import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { FilterPromocionDto } from './dto/filter-promocion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Promociones')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('promociones')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva promoción',
    description:
      'Crea promoción con configuración completa: tipo (descuento_porcentaje/descuento_monto/2x1/3x2/precio_fijo/combo), aplicación (producto/categoría/total_cuenta), valor del descuento, vigencia (fecha inicio/fin), código promocional opcional, máximo de usos, si es combinable con otras promociones, días/horarios de aplicación, productos/categorías elegibles. Valida código único si se proporciona. Estado activo por default. Usado para gestión de ofertas especiales, happy hours, promociones temporales.',
  })
  @ApiResponse({
    status: 201,
    description: 'Promoción creada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Promoción creada exitosamente',
        data: {
          id_promocion: 25,
          nombre: 'Happy Hour Cervezas',
          descripcion: '2x1 en todas las cervezas nacionales de 3pm a 7pm',
          tipo_promocion: '2x1',
          aplicacion: 'categoria',
          categoria: { id: 5, nombre: 'Cervezas' },
          fecha_inicio: '2025-10-15',
          fecha_fin: '2025-12-31',
          codigo_promocional: 'HAPPYHOUR2X1',
          dias_aplica: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
          horario_inicio: '15:00',
          horario_fin: '19:00',
          maximo_usos: 1000,
          usos_actuales: 0,
          combinable: false,
          activa: true,
          fecha_creacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'La fecha de fin debe ser posterior a la fecha de inicio',
          'El porcentaje de descuento debe estar entre 1 y 100',
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
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden crear promociones',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una promoción con ese código',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['Ya existe una promoción con el código "HAPPYHOUR2X1"'],
        data: {
          promocion_existente: {
            id: 20,
            nombre: 'Happy Hour Anterior',
            activa: false,
          },
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createPromocionDto: CreatePromocionDto) {
    return this.promocionesService.create(createPromocionDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener todas las promociones con filtros y paginación',
    description:
      'Lista promociones con búsqueda textual y múltiples filtros: por nombre/descripción/código, tipo de promoción, aplicación, estado activo/inactivo, fecha vigente específica, si es combinable, producto/categoría asociada. Incluye contador de usos y disponibilidad. Soporta paginación y ordenamiento. Usado para gestión de promociones, consulta en punto de venta y aplicación de descuentos.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Buscar por nombre, descripción o código (búsqueda parcial)',
    example: 'happy hour',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    description: 'Filtrar por tipo de promoción',
    enum: [
      'descuento_porcentaje',
      'descuento_monto',
      '2x1',
      '3x2',
      'precio_fijo',
      'combo',
    ],
    example: '2x1',
  })
  @ApiQuery({
    name: 'aplicacion',
    required: false,
    description: 'Filtrar por ámbito de aplicación',
    enum: ['producto', 'categoria', 'total_cuenta'],
    example: 'categoria',
  })
  @ApiQuery({
    name: 'activa',
    required: false,
    description: 'Filtrar por estado activo (true) o inactivo (false)',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'fecha_vigente',
    required: false,
    description:
      'Filtrar promociones vigentes en esta fecha específica (YYYY-MM-DD). Si no se proporciona, muestra todas',
    example: '2025-10-15',
  })
  @ApiQuery({
    name: 'codigo_promocional',
    required: false,
    description: 'Buscar por código promocional exacto',
    example: 'HAPPYHOUR2X1',
  })
  @ApiQuery({
    name: 'combinable',
    required: false,
    description: 'Filtrar solo promociones combinables con otras',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    description: 'Filtrar promociones aplicables a producto específico',
    type: Number,
    example: 12,
  })
  @ApiQuery({
    name: 'id_categoria',
    required: false,
    description: 'Filtrar promociones aplicables a categoría específica',
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (inicia en 1)',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Resultados por página (default: 20, max: 100)',
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo por el que ordenar',
    enum: ['nombre', 'fecha_inicio', 'fecha_fin', 'usos_actuales'],
    example: 'fecha_inicio',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de promociones obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_promocion: 25,
            nombre: 'Happy Hour Cervezas',
            tipo: '2x1',
            aplicacion: 'categoria',
            codigo: 'HAPPYHOUR2X1',
            vigente: true,
            fecha_inicio: '2025-10-15',
            fecha_fin: '2025-12-31',
            usos: '45/1000',
            activa: true,
          },
          {
            id_promocion: 22,
            nombre: '15% Descuento Total',
            tipo: 'descuento_porcentaje',
            aplicacion: 'total_cuenta',
            valor: 15,
            codigo: 'DESC15',
            vigente: true,
            fecha_inicio: '2025-10-01',
            fecha_fin: '2025-10-31',
            usos: '230/500',
            activa: true,
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
        total_pages: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterPromocionDto) {
    return this.promocionesService.findAll(filters);
  }

  @Get('vigentes')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener solo promociones vigentes actualmente',
    description:
      'Retorna promociones activas y vigentes en el momento actual: dentro del rango de fechas, en horario válido si aplica, con usos disponibles, estado activo. Formato optimizado para aplicación rápida en punto de venta. Ordenadas por prioridad o fecha. Usado en punto de venta para mostrar promociones aplicables.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de promociones vigentes',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_promocion: 25,
            nombre: 'Happy Hour Cervezas',
            descripcion: '2x1 en todas las cervezas nacionales',
            tipo: '2x1',
            aplicacion: 'categoria',
            categoria: 'Cervezas',
            codigo: 'HAPPYHOUR2X1',
            combinable: false,
            horario: '15:00 - 19:00',
            dias: 'L-V',
            usos_disponibles: 955,
          },
          {
            id_promocion: 22,
            nombre: '15% Descuento Total',
            tipo: 'descuento_porcentaje',
            aplicacion: 'total_cuenta',
            valor: 15,
            codigo: 'DESC15',
            combinable: true,
            valido: 'Todo el día',
            usos_disponibles: 270,
          },
        ],
        total: 2,
        fecha_consulta: '2025-10-15T16:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getPromocionesVigentes() {
    return this.promocionesService.getPromocionesVigentes();
  }

  @Get('codigo/:codigo')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Buscar promoción por código',
    description:
      'Busca y retorna promoción que coincida exactamente con el código proporcionado. Incluye validación de vigencia, disponibilidad de usos, restricciones de horario/días. Útil para aplicar códigos promocionales ingresados por clientes. Código case-insensitive.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código de la promoción (case-insensitive)',
    example: 'HAPPYHOUR2X1',
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción encontrada',
    schema: {
      example: {
        success: true,
        data: {
          id_promocion: 25,
          nombre: 'Happy Hour Cervezas',
          descripcion: '2x1 en todas las cervezas nacionales de 3pm a 7pm',
          tipo: '2x1',
          aplicacion: 'categoria',
          codigo: 'HAPPYHOUR2X1',
          vigente: true,
          puede_aplicarse_ahora: true,
          restricciones: {
            horario: '15:00 - 19:00',
            dias: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
          },
          usos: {
            actuales: 45,
            maximo: 1000,
            disponibles: 955,
          },
          activa: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Promoción no encontrada',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['No se encontró promoción con código "INVALIDO123"'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.promocionesService.findByCodigo(codigo);
  }

  @Post('validar-codigo/:codigo')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Validar si un código de promoción es válido y puede usarse',
    description:
      'Valida código promocional verificando múltiples criterios: código existe, promoción activa, está vigente (dentro de fechas), horario actual válido, día de semana aplicable, tiene usos disponibles, no excede máximo. Retorna promoción con detalle si es válida, o mensaje de error específico si no lo es. Usado antes de aplicar promoción en orden para validar elegibilidad.',
  })
  @ApiParam({
    name: 'codigo',
    description: 'Código de la promoción a validar',
    example: 'HAPPYHOUR2X1',
  })
  @ApiResponse({
    status: 200,
    description: 'Código válido y puede aplicarse',
    schema: {
      example: {
        success: true,
        message: 'Código promocional válido',
        data: {
          promocion: {
            id_promocion: 25,
            nombre: 'Happy Hour Cervezas',
            tipo: '2x1',
            codigo: 'HAPPYHOUR2X1',
            aplicacion: 'categoria',
            categoria: 'Cervezas',
          },
          validacion: {
            es_valido: true,
            puede_aplicarse: true,
            usos_disponibles: 955,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido, expirado o sin usos disponibles',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['El código ha alcanzado su límite máximo de usos'],
        data: {
          promocion: 'Happy Hour Cervezas',
          codigo: 'HAPPYHOUR2X1',
          razon: 'sin_usos_disponibles',
          detalles: {
            usos_actuales: 1000,
            maximo_usos: 1000,
          },
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Código no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Código promocional "INVALIDO" no existe'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  validarCodigo(@Param('codigo') codigo: string) {
    return this.promocionesService.validarCodigo(codigo);
  }

  @Get(':id/estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de uso de una promoción',
    description:
      'Métricas detalladas de promoción: total de usos, distribución temporal (por día/semana), órdenes aplicadas, descuento total otorgado, tickets promedio con/sin promoción, productos más beneficiados, tasas de conversión. Compara rendimiento vs expectativas. Usado para análisis de efectividad de promociones y ROI.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          promocion: {
            id: 25,
            nombre: 'Happy Hour Cervezas',
            tipo: '2x1',
            codigo: 'HAPPYHOUR2X1',
            estado: 'activa',
          },
          periodo: {
            fecha_inicio: '2025-10-15',
            fecha_fin: '2025-12-31',
            dias_transcurridos: 15,
            dias_restantes: 62,
          },
          uso: {
            total_aplicaciones: 45,
            usos_disponibles: 955,
            tasa_uso: 4.5,
            promedio_diario: 3.0,
            proyeccion_fin_periodo: 186,
          },
          impacto_financiero: {
            descuento_total_otorgado: 8100.0,
            ticket_promedio_con_promo: 180.0,
            ticket_promedio_sin_promo: 240.0,
            ahorro_promedio_cliente: 60.0,
          },
          distribucion_temporal: [
            { dia: '2025-10-15', usos: 8 },
            { dia: '2025-10-16', usos: 5 },
            { dia: '2025-10-17', usos: 6 },
          ],
          productos_mas_beneficiados: [
            {
              producto: 'Cerveza Corona 355ml',
              veces_aplicado: 78,
              descuento_total: 4680.0,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.getEstadisticas(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero', 'Mesero')
  @ApiOperation({
    summary: 'Obtener una promoción por ID',
    description:
      'Retorna información completa de promoción específica: configuración, restricciones, vigencia, productos/categorías asociadas, contador de usos, estado. Incluye validación de si puede aplicarse actualmente. Usado para consulta detallada y edición.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción encontrada con todos los detalles',
    schema: {
      example: {
        success: true,
        data: {
          id_promocion: 25,
          nombre: 'Happy Hour Cervezas',
          descripcion: '2x1 en todas las cervezas nacionales de 3pm a 7pm',
          tipo_promocion: '2x1',
          aplicacion: 'categoria',
          categoria: {
            id: 5,
            nombre: 'Cervezas',
            productos_count: 15,
          },
          valor_descuento: null,
          porcentaje_descuento: null,
          fecha_inicio: '2025-10-15',
          fecha_fin: '2025-12-31',
          codigo_promocional: 'HAPPYHOUR2X1',
          dias_aplica: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
          horario_inicio: '15:00',
          horario_fin: '19:00',
          maximo_usos: 1000,
          usos_actuales: 45,
          usos_disponibles: 955,
          combinable: false,
          activa: true,
          puede_aplicarse_ahora: true,
          terminos_condiciones: 'No acumulable con otras promociones',
          fecha_creacion: '2025-10-15T10:00:00.000Z',
          ultima_modificacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Promoción no encontrada',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Promoción con ID 999 no encontrada'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Actualizar una promoción',
    description:
      'Modifica promoción existente: nombre, descripción, fechas de vigencia, horarios, días aplicables, productos/categorías, valor de descuento, máximo de usos. Permite extender vigencia o ajustar configuración. Valida código único si se modifica. No afecta usos ya aplicados. Registra modificación. Usado para ajustar promociones activas o corregir configuración.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción a actualizar',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description: 'Promoción actualizada exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Promoción actualizada exitosamente',
        data: {
          id_promocion: 25,
          nombre: 'Happy Hour Cervezas Extendido',
          fecha_fin_anterior: '2025-12-31',
          fecha_fin_nueva: '2026-03-31',
          maximo_usos_anterior: 1000,
          maximo_usos_nuevo: 2000,
          ultima_modificacion: '2025-10-15T20:00:00.000Z',
          modificado_por: 'Gerente',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: [
          'El máximo de usos no puede ser menor a los usos actuales (45)',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador y Gerente pueden actualizar',
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra promoción con ese código',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['El código "VERANO2026" ya está en uso por otra promoción'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePromocionDto: UpdatePromocionDto,
  ) {
    return this.promocionesService.update(id, updatePromocionDto);
  }

  @Patch(':id/toggle-active')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Activar/Desactivar una promoción',
    description:
      'Cambia el estado activo/inactivo de promoción. Promociones inactivas no se muestran ni aplican en punto de venta, pero mantienen historial de usos. No elimina datos. Útil para pausar temporalmente promoción sin perder configuración, o para terminar promoción antes de fecha fin. Acción reversible.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la promoción actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Promoción desactivada exitosamente',
        data: {
          id_promocion: 25,
          nombre: 'Happy Hour Cervezas',
          activa: false,
          fecha_cambio: '2025-10-15T20:00:00.000Z',
          modificado_por: 'Gerente',
          razon: 'Pausada temporalmente por inventario bajo',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador y Gerente',
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.toggleActive(id);
  }

  @Patch(':id/incrementar-usos')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Incrementar el contador de usos de una promoción',
    description:
      'Incrementa contador de usos en 1 cuando promoción es aplicada a orden. Valida que no exceda máximo configurado. Actualiza estadísticas automáticamente. Generalmente llamado por sistema al aplicar promoción, no manualmente. Protegido contra race conditions. Usado internamente al procesar órdenes con promociones.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description: 'Usos incrementados exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Uso de promoción registrado exitosamente',
        data: {
          id_promocion: 25,
          nombre: 'Happy Hour Cervezas',
          usos_anterior: 45,
          usos_nuevo: 46,
          usos_disponibles: 954,
          fecha_incremento: '2025-10-15T16:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Se alcanzó el máximo de usos',
    schema: {
      example: {
        success: false,
        code: 400,
        message: ['La promoción ha alcanzado su límite máximo de 1000 usos'],
        data: {
          usos_actuales: 1000,
          maximo_usos: 1000,
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  incrementarUsos(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.incrementarUsos(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una promoción (solo si no está siendo usada en órdenes)',
    description:
      'Elimina físicamente promoción del sistema. SOLO permite eliminación si NO tiene ninguna aplicación en órdenes históricas. Si ya se usó, debe usar desactivación en su lugar para mantener integridad de datos. Operación irreversible, requiere rol de Administrador. Usado para limpiar promociones de prueba o creadas por error antes de ser utilizadas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la promoción a eliminar',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 204,
    description:
      'Promoción eliminada exitosamente (sin contenido en respuesta)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador puede eliminar',
  })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, está siendo usada en órdenes',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'No se puede eliminar: la promoción ha sido aplicada en 45 órdenes',
        ],
        data: {
          total_usos: 45,
          primera_aplicacion: '2025-10-15',
          ultima_aplicacion: '2025-10-29',
          descuento_total_otorgado: 8100.0,
          ordenes_afectadas: 45,
        },
        suggestion:
          'Use desactivación en lugar de eliminación para mantener historial',
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.promocionesService.remove(id);
  }
}
