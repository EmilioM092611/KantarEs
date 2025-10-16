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
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { FilterProveedorDto } from './dto/filter-proveedor.dto';
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

@ApiTags('Proveedores')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo proveedor',
    description:
      'Registra un nuevo proveedor en el sistema con datos fiscales completos: razón social, nombre comercial, RFC, datos de contacto (teléfono, email), dirección fiscal completa, datos bancarios, condiciones comerciales (días de crédito, descuentos), calificación inicial. Valida que RFC sea único. Configura estado activo por defecto. Permite asociar productos/categorías que suministra. Usado para gestión de cadena de suministro y creación de órdenes de compra.',
  })
  @ApiResponse({
    status: 201,
    description: 'Proveedor creado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Proveedor creado exitosamente',
        data: {
          id_proveedor: 15,
          razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
          nombre_comercial: 'Bebidas del Norte',
          rfc: 'DBN850615XYZ',
          contacto: {
            telefono: '442-123-4567',
            email: 'ventas@bebidasnorte.com',
            contacto_nombre: 'Juan Pérez',
          },
          direccion: {
            calle: 'Av. Industrial 123',
            colonia: 'Zona Industrial',
            ciudad: 'Querétaro',
            estado: 'Querétaro',
            cp: '76120',
          },
          condiciones_comerciales: {
            dias_credito: 30,
            descuento_pronto_pago: 2.5,
          },
          calificacion: 5.0,
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
        message: ['RFC debe tener 12 o 13 caracteres'],
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
      'Permiso denegado - Solo Administrador y Gerente pueden crear proveedores',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un proveedor con ese RFC',
    schema: {
      example: {
        success: false,
        code: 409,
        message: ['Ya existe un proveedor con el RFC "DBN850615XYZ"'],
        data: {
          proveedor_existente: {
            id: 10,
            razon_social: 'Distribuidora Norte',
            activo: true,
          },
        },
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener todos los proveedores con filtros y paginación',
    description:
      'Lista proveedores con búsqueda textual y múltiples filtros: por razón social/nombre comercial/RFC (búsqueda parcial), estado activo/inactivo, ciudad, estado, calificación mínima. Soporta ordenamiento por múltiples campos y paginación. Incluye resumen de compras si está disponible. Usado para gestión de proveedores, selección en órdenes de compra y reportes.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description:
      'Buscar por razón social, nombre comercial o RFC (búsqueda parcial case-insensitive)',
    example: 'Bebidas',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por estado activo (true) o inactivo (false)',
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: 'ciudad',
    required: false,
    description: 'Filtrar por ciudad',
    example: 'Querétaro',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    description: 'Filtrar por estado/provincia',
    example: 'Querétaro',
  })
  @ApiQuery({
    name: 'calificacion_min',
    required: false,
    description: 'Filtrar proveedores con calificación mínima (1-5)',
    type: Number,
    example: 4.0,
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
    enum: [
      'razon_social',
      'nombre_comercial',
      'calificacion',
      'fecha_registro',
    ],
    example: 'razon_social',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    example: 'asc',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_proveedor: 15,
            razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
            nombre_comercial: 'Bebidas del Norte',
            rfc: 'DBN850615XYZ',
            telefono: '442-123-4567',
            ciudad: 'Querétaro',
            estado: 'Querétaro',
            calificacion: 5.0,
            activo: true,
            total_compras: 45,
            monto_compras_total: 125000.0,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        total_pages: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() filters: FilterProveedorDto) {
    return this.proveedoresService.findAll(filters);
  }

  @Get('activos')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener solo proveedores activos (para selects/dropdowns)',
    description:
      'Retorna lista simplificada de proveedores habilitados (activo=true). Formato optimizado para selectores y dropdowns: solo ID, nombre comercial y datos esenciales. Excluye proveedores deshabilitados. Ordenados alfabéticamente. Usado en formularios de órdenes de compra y asignación rápida de proveedor.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de proveedores activos obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_proveedor: 15,
            nombre_comercial: 'Bebidas del Norte',
            razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
            rfc: 'DBN850615XYZ',
            telefono: '442-123-4567',
          },
          {
            id_proveedor: 18,
            nombre_comercial: 'Carnes Premium',
            razon_social: 'Carnes y Frigoríficos Premium S.A.',
            rfc: 'CFP920315ABC',
            telefono: '442-987-6543',
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProveedoresActivos() {
    return this.proveedoresService.getProveedoresActivos();
  }

  @Get('rfc/:rfc')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Buscar proveedor por RFC',
    description:
      'Busca y retorna proveedor que coincida exactamente con el RFC proporcionado. Útil para validar duplicados antes de crear, buscar datos fiscales o consultar proveedor por documento. RFC debe ser exacto (case-insensitive).',
  })
  @ApiParam({
    name: 'rfc',
    description: 'RFC del proveedor (12 o 13 caracteres)',
    example: 'DBN850615XYZ',
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado',
    schema: {
      example: {
        success: true,
        data: {
          id_proveedor: 15,
          razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
          nombre_comercial: 'Bebidas del Norte',
          rfc: 'DBN850615XYZ',
          contacto: {
            telefono: '442-123-4567',
            email: 'ventas@bebidasnorte.com',
          },
          activo: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Proveedor no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['No se encontró proveedor con RFC "DBN850615XYZ"'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findByRfc(@Param('rfc') rfc: string) {
    return this.proveedoresService.findByRfc(rfc);
  }

  @Get(':id/historial-compras')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener historial de compras de un proveedor',
    description:
      'Lista completa de órdenes de compra realizadas a un proveedor específico. Incluye: folio, fecha, estado, monto, productos, tiempos de entrega. Ordenado por fecha descendente. Útil para evaluación de proveedores, negociaciones y análisis de relación comercial.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de compras obtenido exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          proveedor: {
            id: 15,
            nombre: 'Bebidas del Norte',
            rfc: 'DBN850615XYZ',
          },
          compras: [
            {
              id_compra: 123,
              folio: 'COMP-2025-123',
              fecha: '2025-10-10',
              estado: 'Recibida',
              total: 5600.0,
              productos_count: 8,
              tiempo_entrega_dias: 3,
            },
            {
              id_compra: 115,
              folio: 'COMP-2025-115',
              fecha: '2025-09-25',
              estado: 'Recibida',
              total: 4200.0,
              productos_count: 6,
              tiempo_entrega_dias: 2,
            },
          ],
          total_compras: 2,
          monto_total: 9800.0,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  getHistorialCompras(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.getHistorialCompras(id);
  }

  @Get(':id/estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de compras de un proveedor',
    description:
      'Métricas y KPIs del proveedor: total de compras, monto total histórico, promedio por compra, productos más comprados, tiempo promedio de entrega, tasa de cumplimiento, devoluciones. Calcula tendencias y compara con promedios. Usado para evaluación de desempeño y toma de decisiones de compra.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          proveedor: {
            id: 15,
            nombre: 'Bebidas del Norte',
            calificacion: 5.0,
            activo: true,
          },
          metricas: {
            total_compras: 45,
            monto_total: 125000.0,
            promedio_compra: 2777.78,
            ultima_compra: '2025-10-10',
            frecuencia_dias: 7.5,
          },
          desempeno: {
            tiempo_entrega_promedio_dias: 2.8,
            tasa_cumplimiento: 95.5,
            ordenes_a_tiempo: 43,
            ordenes_retrasadas: 2,
            productos_devueltos: 3,
            tasa_devolucion: 0.8,
          },
          top_productos: [
            {
              producto: 'Cerveza Corona 355ml',
              cantidad_total: 1200,
              monto_total: 22000.0,
              frecuencia: 40,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  getEstadisticas(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.getEstadisticas(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Obtener un proveedor por ID',
    description:
      'Retorna información completa de un proveedor específico: datos fiscales, contacto, dirección, condiciones comerciales, datos bancarios, calificación, estado. Incluye resumen de relación comercial si está disponible. Usado para consulta detallada y edición.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor encontrado con todos los detalles',
    schema: {
      example: {
        success: true,
        data: {
          id_proveedor: 15,
          razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
          nombre_comercial: 'Bebidas del Norte',
          rfc: 'DBN850615XYZ',
          contacto: {
            telefono: '442-123-4567',
            email: 'ventas@bebidasnorte.com',
            contacto_nombre: 'Juan Pérez',
            contacto_puesto: 'Gerente de Ventas',
          },
          direccion: {
            calle: 'Av. Industrial 123',
            colonia: 'Zona Industrial',
            ciudad: 'Querétaro',
            estado: 'Querétaro',
            cp: '76120',
            pais: 'México',
          },
          condiciones_comerciales: {
            dias_credito: 30,
            descuento_pronto_pago: 2.5,
            dias_descuento: 10,
          },
          datos_bancarios: {
            banco: 'BBVA',
            cuenta: '0123456789',
            clabe: '012345678901234567',
          },
          calificacion: 5.0,
          activo: true,
          notas: 'Proveedor confiable con entregas puntuales',
          fecha_registro: '2024-01-15T10:00:00.000Z',
          ultima_modificacion: '2025-10-10T15:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Proveedor no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Proveedor con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Actualizar un proveedor',
    description:
      'Modifica información de proveedor existente: datos de contacto, dirección, condiciones comerciales, datos bancarios, calificación. Permite actualizar RFC con validación de unicidad. No afecta compras históricas. Registra usuario y fecha de modificación. Usado para mantener información actualizada de proveedores.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor a actualizar',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Proveedor actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Proveedor actualizado exitosamente',
        data: {
          id_proveedor: 15,
          razon_social: 'Distribuidora de Bebidas del Norte S.A. de C.V.',
          contacto: {
            telefono: '442-123-9999',
            email: 'ventas@bebidasnorte.com',
          },
          calificacion: 4.8,
          ultima_modificacion: '2025-10-15T20:00:00.000Z',
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
        message: ['Calificación debe estar entre 1 y 5'],
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
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otro proveedor con ese RFC',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'El RFC "DBN850615XYZ" ya está registrado con otro proveedor',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedorDto: UpdateProveedorDto,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto);
  }

  @Patch(':id/toggle-active')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Activar/Desactivar un proveedor',
    description:
      'Cambia el estado activo/inactivo de un proveedor. Proveedores inactivos no aparecen en selectores ni permiten nuevas órdenes de compra, pero mantienen historial. No elimina datos. Usado para deshabilitar proveedores que ya no se usan, tienen problemas o están en revisión. Acción reversible.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del proveedor actualizado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Proveedor desactivado exitosamente',
        data: {
          id_proveedor: 15,
          nombre_comercial: 'Bebidas del Norte',
          activo: false,
          fecha_cambio: '2025-10-15T20:00:00.000Z',
          modificado_por: 'Gerente',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador y Gerente',
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.toggleActive(id);
  }

  @Delete(':id')
  @Roles('Administrador')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un proveedor (solo si no tiene compras asociadas)',
    description:
      'Elimina físicamente un proveedor del sistema. SOLO permite eliminación si NO tiene ninguna orden de compra asociada. Si tiene compras, debe usar desactivación en su lugar. Operación irreversible, requiere rol de Administrador. Usado para limpiar proveedores creados por error o de prueba antes de usar el sistema en producción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del proveedor a eliminar',
    type: Number,
    example: 15,
  })
  @ApiResponse({
    status: 204,
    description:
      'Proveedor eliminado exitosamente (sin contenido en respuesta)',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador puede eliminar',
  })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar, tiene compras asociadas',
    schema: {
      example: {
        success: false,
        code: 409,
        message: [
          'No se puede eliminar: el proveedor tiene 45 órdenes de compra registradas',
        ],
        data: {
          total_compras: 45,
          monto_total: 125000.0,
          primera_compra: '2024-01-20',
          ultima_compra: '2025-10-10',
        },
        suggestion: 'Use desactivación en lugar de eliminación',
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }
}
