import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { FilterAuditoriaDto } from './dto/filter-auditoria.dto';
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

@ApiTags('Auditoría del Sistema')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  @Roles('Administrador', 'Gerente')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar una acción en la auditoría',
    description:
      'Registra manualmente una acción en el sistema de auditoría. Incluye tabla afectada, ID de registro, tipo de acción (INSERT/UPDATE/DELETE), valores anteriores y nuevos, usuario responsable, IP, user-agent. Generalmente el sistema registra auditoría automáticamente mediante triggers o middleware, este endpoint es para casos especiales o registros manuales. Útil para operaciones que no pasan por endpoints estándar o acciones administrativas especiales que requieren trazabilidad explícita.',
  })
  @ApiResponse({
    status: 201,
    description: 'Acción registrada exitosamente en auditoría',
    schema: {
      example: {
        success: true,
        message: 'Acción registrada en auditoría exitosamente',
        data: {
          id_auditoria: 12345,
          tabla_afectada: 'productos',
          id_registro: 45,
          accion: 'UPDATE',
          usuario: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
          },
          valores_anteriores: {
            precio: 100.0,
            stock: 50,
          },
          valores_nuevos: {
            precio: 120.0,
            stock: 48,
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0...',
          fecha_accion: '2025-10-15T20:00:00.000Z',
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
        message: ['La acción debe ser INSERT, UPDATE o DELETE'],
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
      'Permiso denegado - Solo Administrador y Gerente pueden registrar auditoría manual',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Usuario con ID 99 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Get()
  @Roles('Administrador')
  @ApiOperation({
    summary:
      'Obtener todos los registros de auditoría con filtros y paginación',
    description:
      'Lista completa de registros de auditoría del sistema con múltiples filtros: por tabla afectada, ID de registro específico, tipo de acción (INSERT/UPDATE/DELETE), usuario, IP, rango de fechas. Soporta paginación y ordenamiento. Retorna cambios con valores antes/después. Usado para auditorías de seguridad, compliance, investigación de incidentes, análisis de actividad de usuarios, rastreo de cambios críticos. CRÍTICO para cumplimiento regulatorio y seguridad.',
  })
  @ApiQuery({
    name: 'tabla_afectada',
    required: false,
    description:
      'Filtrar por nombre de tabla (productos, ordenes, usuarios, etc.)',
    example: 'productos',
  })
  @ApiQuery({
    name: 'id_registro',
    required: false,
    description: 'Filtrar por ID específico del registro afectado',
    type: Number,
    example: 45,
  })
  @ApiQuery({
    name: 'accion',
    required: false,
    description: 'Filtrar por tipo de acción realizada',
    enum: ['INSERT', 'UPDATE', 'DELETE'],
    example: 'UPDATE',
  })
  @ApiQuery({
    name: 'id_usuario',
    required: false,
    description: 'Filtrar por usuario que realizó la acción',
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: 'ip_address',
    required: false,
    description: 'Filtrar por dirección IP origen',
    example: '192.168.1.100',
  })
  @ApiQuery({
    name: 'fecha_desde',
    required: false,
    description: 'Fecha inicio del rango (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'fecha_hasta',
    required: false,
    description: 'Fecha fin del rango (YYYY-MM-DD)',
    example: '2025-10-15',
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
    description:
      'Resultados por página (default: 50, max: 500 por performance)',
    type: Number,
    example: 50,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo por el que ordenar',
    enum: ['fecha_accion', 'tabla_afectada', 'accion', 'usuario'],
    example: 'fecha_accion',
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
    description: 'Lista de registros de auditoría obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: [
          {
            id_auditoria: 12345,
            tabla: 'productos',
            id_registro: 45,
            accion: 'UPDATE',
            usuario: 'Juan Pérez',
            cambios: {
              precio: { anterior: 100.0, nuevo: 120.0 },
              stock: { anterior: 50, nuevo: 48 },
            },
            ip: '192.168.1.100',
            fecha: '2025-10-15T20:00:00.000Z',
          },
          {
            id_auditoria: 12344,
            tabla: 'ordenes',
            id_registro: 456,
            accion: 'INSERT',
            usuario: 'María González',
            ip: '192.168.1.105',
            fecha: '2025-10-15T19:45:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        limit: 50,
        total_pages: 1,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description:
      'Permiso denegado - Solo Administrador puede ver auditoría completa',
  })
  findAll(@Query() filters: FilterAuditoriaDto) {
    return this.auditoriaService.findAll(filters);
  }

  @Get('estadisticas')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Obtener estadísticas generales de auditoría',
    description:
      'Dashboard de métricas de auditoría: total de acciones registradas, distribución por tipo (INSERT/UPDATE/DELETE), actividad por tabla, usuarios más activos, IPs más frecuentes, tendencias temporales, patrones sospechosos. Incluye alertas de actividad inusual. Periodo configurable. Usado para dashboards de seguridad, análisis de comportamiento, detección de anomalías, reportes de compliance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          resumen_general: {
            total_acciones: 45678,
            periodo: {
              desde: '2025-10-01',
              hasta: '2025-10-15',
            },
          },
          por_accion: {
            INSERT: { cantidad: 15234, porcentaje: 33.4 },
            UPDATE: { cantidad: 28901, porcentaje: 63.3 },
            DELETE: { cantidad: 1543, porcentaje: 3.3 },
          },
          tablas_mas_modificadas: [
            { tabla: 'ordenes', acciones: 12000, porcentaje: 26.3 },
            { tabla: 'orden_detalle', acciones: 10500, porcentaje: 23.0 },
            { tabla: 'productos', acciones: 5000, porcentaje: 10.9 },
          ],
          usuarios_mas_activos: [
            {
              usuario: 'Juan Pérez',
              acciones: 3450,
              rol: 'Gerente',
            },
            {
              usuario: 'María González',
              acciones: 2890,
              rol: 'Cajero',
            },
          ],
          ips_mas_frecuentes: [
            { ip: '192.168.1.100', acciones: 8900 },
            { ip: '192.168.1.105', acciones: 7200 },
          ],
          actividad_por_hora: [
            { hora: '08:00', acciones: 450 },
            { hora: '12:00', acciones: 890 },
            { hora: '18:00', acciones: 1200 },
          ],
          alertas: [
            {
              tipo: 'actividad_inusual',
              mensaje: '500 DELETE en últimas 24h (promedio: 50)',
              severidad: 'alta',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador',
  })
  getEstadisticas() {
    return this.auditoriaService.getEstadisticas();
  }

  @Get('tabla/:tabla')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener historial de cambios de una tabla específica',
    description:
      'Lista todos los cambios registrados en una tabla específica del sistema. Ordenado cronológicamente descendente. Incluye usuario, acción, valores modificados, fecha/hora. Límite configurable (default: 100). Usado para auditar cambios en tablas críticas (productos, precios, usuarios, configuración), rastrear modificaciones específicas, análisis de datos históricos.',
  })
  @ApiParam({
    name: 'tabla',
    description: 'Nombre exacto de la tabla a auditar (case-sensitive)',
    example: 'productos',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de registros a obtener (default: 100, max: 1000)',
    type: Number,
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de la tabla obtenido exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          tabla: 'productos',
          total_cambios: 5000,
          cambios_retornados: 100,
          historial: [
            {
              id_auditoria: 12345,
              id_registro: 45,
              accion: 'UPDATE',
              usuario: 'Juan Pérez',
              cambios: {
                precio: { anterior: 100.0, nuevo: 120.0 },
              },
              fecha: '2025-10-15T20:00:00.000Z',
            },
            {
              id_auditoria: 12340,
              id_registro: 46,
              accion: 'INSERT',
              usuario: 'María González',
              fecha: '2025-10-15T19:30:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Tabla no encontrada en auditoría',
    schema: {
      example: {
        success: false,
        code: 404,
        message: [
          'No se encontraron registros de auditoría para la tabla "tablainvalida"',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findByTabla(
    @Param('tabla') tabla: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditoriaService.findByTabla(tabla, limit);
  }

  @Get('tabla/:tabla/registro/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener historial de cambios de un registro específico',
    description:
      'Rastrea todos los cambios históricos de UN registro específico en una tabla. Muestra línea de tiempo completa: creación, todas las modificaciones, eliminación si aplica. Incluye quién hizo cada cambio, cuándo, qué valores tenía antes/después. Esencial para auditorías detalladas, resolución de disputas, análisis forense, rollback de datos. Ejemplo: ver historial completo de un producto específico.',
  })
  @ApiParam({
    name: 'tabla',
    description: 'Nombre de la tabla',
    example: 'productos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro a rastrear',
    type: Number,
    example: 45,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial del registro obtenido exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          tabla: 'productos',
          id_registro: 45,
          registro_actual: {
            id: 45,
            nombre: 'Cerveza Corona 355ml',
            precio: 120.0,
            stock: 48,
          },
          historial_completo: [
            {
              id_auditoria: 12345,
              accion: 'UPDATE',
              usuario: 'Juan Pérez',
              cambios: {
                precio: { anterior: 100.0, nuevo: 120.0 },
                stock: { anterior: 50, nuevo: 48 },
              },
              fecha: '2025-10-15T20:00:00.000Z',
            },
            {
              id_auditoria: 11000,
              accion: 'UPDATE',
              usuario: 'Carlos Méndez',
              cambios: {
                precio: { anterior: 95.0, nuevo: 100.0 },
              },
              fecha: '2025-10-01T10:00:00.000Z',
            },
            {
              id_auditoria: 9500,
              accion: 'INSERT',
              usuario: 'Admin',
              valores_iniciales: {
                nombre: 'Cerveza Corona 355ml',
                precio: 95.0,
                stock: 100,
              },
              fecha: '2025-09-15T08:00:00.000Z',
            },
          ],
          total_cambios: 3,
          fecha_creacion: '2025-09-15T08:00:00.000Z',
          ultima_modificacion: '2025-10-15T20:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró historial para este registro',
    schema: {
      example: {
        success: false,
        code: 404,
        message: [
          'No se encontró historial para el registro ID 999 en tabla "productos"',
        ],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findByTablaAndRegistro(
    @Param('tabla') tabla: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.auditoriaService.findByTablaAndRegistro(tabla, id);
  }

  @Get('usuario/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener acciones recientes de un usuario',
    description:
      'Lista actividad reciente de un usuario específico en el sistema. Muestra qué tablas modificó, qué acciones realizó, cuándo y desde qué IP. Ordenado por fecha descendente. Límite configurable. Usado para monitoreo de actividad de empleados, auditorías de usuario, investigación de incidentes, evaluación de productividad, detección de comportamiento anómalo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a auditar',
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de acciones a obtener (default: 50, max: 500)',
    type: Number,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Acciones del usuario obtenidas exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          usuario: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
            email: 'juan.perez@restaurant.com',
          },
          total_acciones: 3450,
          acciones_retornadas: 50,
          acciones_recientes: [
            {
              id_auditoria: 12345,
              tabla: 'productos',
              id_registro: 45,
              accion: 'UPDATE',
              cambios_realizados: {
                precio: { anterior: 100.0, nuevo: 120.0 },
              },
              ip: '192.168.1.100',
              fecha: '2025-10-15T20:00:00.000Z',
            },
            {
              id_auditoria: 12340,
              tabla: 'ordenes',
              id_registro: 456,
              accion: 'UPDATE',
              cambios_realizados: {
                estado: { anterior: 'Pendiente', nuevo: 'Pagada' },
              },
              ip: '192.168.1.100',
              fecha: '2025-10-15T19:45:00.000Z',
            },
          ],
          resumen_actividad: {
            tablas_modificadas: ['productos', 'ordenes', 'pagos'],
            acciones: {
              INSERT: 450,
              UPDATE: 2890,
              DELETE: 110,
            },
            periodo: {
              primera_accion: '2025-09-01T08:00:00.000Z',
              ultima_accion: '2025-10-15T20:00:00.000Z',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Usuario con ID 999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findByUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditoriaService.findByUsuario(id, limit);
  }

  @Get('ip/:ip')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Obtener actividad desde una dirección IP específica',
    description:
      'Rastrea toda la actividad originada desde una IP específica. Incluye usuarios que se conectaron desde esa IP, acciones realizadas, tablas modificadas, patrones temporales. Crucial para seguridad: detectar accesos no autorizados, IPs sospechosas, múltiples usuarios desde misma IP (compartir credenciales), actividad fuera de horario. Usado en investigaciones de seguridad y análisis de amenazas.',
  })
  @ApiParam({
    name: 'ip',
    description: 'Dirección IP a investigar (IPv4 o IPv6)',
    example: '192.168.1.100',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de acciones a obtener (default: 100, max: 1000)',
    type: Number,
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'Actividad de la IP obtenida exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          ip_address: '192.168.1.100',
          total_acciones: 8900,
          acciones_retornadas: 100,
          usuarios_desde_ip: [
            { id: 5, nombre: 'Juan Pérez', acciones: 3450 },
            { id: 8, nombre: 'Carlos Méndez', acciones: 5450 },
          ],
          actividad_reciente: [
            {
              id_auditoria: 12345,
              usuario: 'Juan Pérez',
              tabla: 'productos',
              accion: 'UPDATE',
              fecha: '2025-10-15T20:00:00.000Z',
            },
            {
              id_auditoria: 12344,
              usuario: 'Carlos Méndez',
              tabla: 'ordenes',
              accion: 'INSERT',
              fecha: '2025-10-15T19:58:00.000Z',
            },
          ],
          patrones: {
            horario_mas_activo: '14:00-18:00',
            dias_mas_activos: ['Lunes', 'Martes', 'Miércoles'],
            acciones_fuera_horario: 45,
          },
          alertas: [
            {
              tipo: 'multiples_usuarios',
              mensaje: '2 usuarios diferentes desde misma IP',
              severidad: 'media',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Permiso denegado - Solo Administrador puede auditar por IP',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró actividad desde esta IP',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['No se encontró actividad desde la IP "10.0.0.1"'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  getActividadPorIP(
    @Param('ip') ip: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.auditoriaService.getActividadPorIP(ip, limit);
  }

  @Get(':id/comparar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Comparar valores anteriores y nuevos de un registro de auditoría',
    description:
      'Genera comparación visual/estructurada entre valores antes y después de un cambio específico. Resalta diferencias campo por campo. Incluye metadata del cambio (usuario, fecha, IP). Formato optimizado para visualización de cambios. Usado en interfaces de auditoría para mostrar "qué cambió exactamente", resolución de disputas, análisis de modificaciones.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de auditoría a comparar',
    type: Number,
    example: 12345,
  })
  @ApiResponse({
    status: 200,
    description: 'Comparación realizada exitosamente',
    schema: {
      example: {
        success: true,
        data: {
          id_auditoria: 12345,
          tabla: 'productos',
          id_registro: 45,
          accion: 'UPDATE',
          usuario: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
          },
          metadata: {
            ip: '192.168.1.100',
            user_agent: 'Mozilla/5.0...',
            fecha: '2025-10-15T20:00:00.000Z',
          },
          comparacion: [
            {
              campo: 'precio',
              valor_anterior: 100.0,
              valor_nuevo: 120.0,
              tipo_cambio: 'modificado',
              diferencia: '+20.0',
              porcentaje_cambio: '+20%',
            },
            {
              campo: 'stock',
              valor_anterior: 50,
              valor_nuevo: 48,
              tipo_cambio: 'modificado',
              diferencia: '-2',
            },
            {
              campo: 'nombre',
              valor_anterior: 'Cerveza Corona 355ml',
              valor_nuevo: 'Cerveza Corona 355ml',
              tipo_cambio: 'sin_cambio',
            },
          ],
          resumen: {
            campos_modificados: 2,
            campos_sin_cambio: 1,
            total_campos: 3,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Registro de auditoría no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Registro de auditoría con ID 99999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  compareCambios(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.compareCambios(id);
  }

  @Get(':id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener un registro de auditoría por ID',
    description:
      'Retorna detalles completos de un registro específico de auditoría: tabla afectada, ID registro, acción realizada, valores completos antes/después del cambio, usuario responsable, IP origen, user-agent, fecha/hora exacta. Incluye información completa para análisis detallado. Usado para investigación profunda de cambios específicos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del registro de auditoría',
    type: Number,
    example: 12345,
  })
  @ApiResponse({
    status: 200,
    description: 'Registro de auditoría encontrado',
    schema: {
      example: {
        success: true,
        data: {
          id_auditoria: 12345,
          tabla_afectada: 'productos',
          id_registro: 45,
          accion: 'UPDATE',
          usuario: {
            id: 5,
            nombre: 'Juan Pérez',
            rol: 'Gerente',
            email: 'juan.perez@restaurant.com',
          },
          valores_anteriores: {
            precio: 100.0,
            stock: 50,
            nombre: 'Cerveza Corona 355ml',
            activo: true,
          },
          valores_nuevos: {
            precio: 120.0,
            stock: 48,
            nombre: 'Cerveza Corona 355ml',
            activo: true,
          },
          metadata: {
            ip_address: '192.168.1.100',
            user_agent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            request_method: 'PATCH',
            endpoint: '/api/productos/45',
          },
          fecha_accion: '2025-10-15T20:00:00.000Z',
          observaciones: null,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 404,
    description: 'Registro de auditoría no encontrado',
    schema: {
      example: {
        success: false,
        code: 404,
        message: ['Registro de auditoría con ID 99999 no encontrado'],
        timestamp: '2025-10-15T20:00:00.000Z',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.findOne(id);
  }
}
