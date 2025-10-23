import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import {
  QueryVentasDto,
  QueryProductosTopDto,
  QueryComparativoDto,
  QueryAnalisisMeseroDto,
  QueryHorasPicoDto,
  QueryReportesBaseDto,
} from './dto/query-reportes.dto';
import { SugerenciasCompraDto } from './dto/sugerencias-compra.dto';

@ApiTags('Reportes y Estadísticas')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Dashboard con KPIs integrados',
    description:
      'Retorna métricas en tiempo real: ventas del día, variación en comparación a otros días, órdenes activas, ocupación de mesas, productos críticos, propinas, tendencia 7 días, top productos, horas pico. Actualización recomendada: cada 5 minutos. Usado en pantalla principal de administración.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard con KPIs y métricas actualizadas',
  })
  async getDashboard() {
    const dashboard = await this.reportesService.getDashboard();
    return {
      success: true,
      data: dashboard,
      timestamp: new Date(),
    };
  }

  // ==================== VENTAS ====================

  @Get('ventas')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Reporte de ventas con múltiples agrupaciones',
    description:
      'Reporte detallado de ventas con filtros de fecha y agrupación flexible: por hora (análisis intradiario), día (tendencias diarias), semana (comparación semanal), mes (reportes mensuales), categoría (mix de productos), mesero (desempeño individual). Incluye subtotales, descuentos, IVA, propinas, tickets promedio. Usado para análisis de tendencias y toma de decisiones.',
  })
  @ApiQuery({
    name: 'fecha_inicio',
    required: false,
    description: 'Fecha inicio (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'fecha_fin',
    required: false,
    description: 'Fecha fin (YYYY-MM-DD)',
    example: '2025-10-31',
  })
  @ApiQuery({
    name: 'agrupar_por',
    required: false,
    enum: ['hora', 'dia', 'semana', 'mes', 'categoria', 'mesero', 'producto'],
    description: 'Tipo de agrupación',
  })
  @ApiQuery({
    name: 'incluir_canceladas',
    required: false,
    type: Boolean,
    description: 'Incluir órdenes canceladas',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de ventas generado exitosamente',
  })
  async getReporteVentas(@Query() query: QueryVentasDto) {
    const reporte = await this.reportesService.getReporteVentas(query);
    return {
      success: true,
      data: reporte,
    };
  }

  // ==================== PRODUCTOS ====================

  @Get('productos/top')
  @Roles('Administrador', 'Gerente', 'Chef')
  @ApiOperation({
    summary: 'Top productos más vendidos',
    description:
      'Ranking de productos ordenado por cantidad vendida. Incluye: veces vendido, cantidad total, ingresos, precio promedio, utilidad bruta, margen porcentaje. Filtrable por categoría y rango de fechas. Útil para: planificación de compras, diseño de menú, estrategia de precios, identificación de best sellers.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos a retornar (1-100)',
    example: 10,
  })
  @ApiQuery({
    name: 'fecha_inicio',
    required: false,
    description: 'Fecha inicio filtro',
  })
  @ApiQuery({
    name: 'fecha_fin',
    required: false,
    description: 'Fecha fin filtro',
  })
  @ApiQuery({
    name: 'id_categoria',
    required: false,
    type: Number,
    description: 'Filtrar por categoría específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos top',
  })
  async getProductosTop(@Query() query: QueryProductosTopDto) {
    const productos = await this.reportesService.getProductosTop(query);
    return {
      success: true,
      data: productos,
    };
  }

  @Get('productos/bottom')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Productos con peor desempeño',
    description:
      'Ranking de productos menos vendidos. Identifica productos de baja rotación que pueden: requerir promoción, ajuste de precio, rediseño, o eliminación del menú. Incluye recomendaciones automáticas según desempeño. Útil para optimización de inventario y menú.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de productos',
    example: 10,
  })
  @ApiQuery({
    name: 'fecha_inicio',
    required: false,
  })
  @ApiQuery({
    name: 'fecha_fin',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos con bajo desempeño',
  })
  async getProductosBottom(@Query() query: QueryProductosTopDto) {
    const productos = await this.reportesService.getProductosBottom(query);
    return {
      success: true,
      data: productos,
    };
  }

  @Get('productos/rentabilidad')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Análisis de rentabilidad por producto',
    description:
      'Análisis financiero detallado: ingresos totales, costos, utilidad bruta, margen porcentaje, ROI. Clasificación automática (EXCELENTE/BUENA/ACEPTABLE/BAJA/DEFICIENTE). Identifica productos más rentables y los que necesitan ajuste. Crítico para pricing y estrategia comercial.',
  })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_fin', required: false })
  @ApiQuery({ name: 'id_categoria', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Análisis de rentabilidad completado',
  })
  async getAnalisisRentabilidad(@Query() query: QueryProductosTopDto) {
    const analisis = await this.reportesService.getAnalisisRentabilidad(query);
    return {
      success: true,
      data: analisis,
    };
  }

  // ==================== MESEROS ====================

  @Get('meseros/desempeno')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Análisis de desempeño por mesero',
    description:
      'Reporte individual de cada mesero: total órdenes, mesas atendidas, ventas totales, propinas, ticket promedio, tiempo promedio de servicio, días trabajados, ventas/día, propina/orden, % propina sobre ventas. Clasificación de eficiencia (EXCELENTE/BUENA/ACEPTABLE/NECESITA_MEJORAR). Usado para evaluación de personal, bonos, capacitación.',
  })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_fin', required: false })
  @ApiQuery({
    name: 'id_mesero',
    required: false,
    type: Number,
    description: 'Filtrar por mesero específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de desempeño generado',
  })
  async getAnalisisMesero(@Query() query: QueryAnalisisMeseroDto) {
    const analisis = await this.reportesService.getAnalisisMesero(query);
    return {
      success: true,
      data: analisis,
    };
  }

  // ==================== HORAS PICO ====================

  @Get('horas-pico')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Análisis de horas pico de operación',
    description:
      'Identifica horas de mayor demanda: total órdenes, mesas ocupadas, ventas, ticket promedio por hora. Clasificación automática (PICO_ALTO/PICO_MEDIO/NORMAL/BAJO). Filtrable por día de semana. Útil para: planificación de personal, ajuste de turnos, estrategias de promoción en horas bajas, optimización de recursos.',
  })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_fin', required: false })
  @ApiQuery({
    name: 'dia_semana',
    required: false,
    type: Number,
    description: 'Filtrar por día (0=Domingo, 6=Sábado)',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de horas pico completado',
  })
  async getHorasPico(@Query() query: QueryHorasPicoDto) {
    const horas = await this.reportesService.getHorasPico(query);
    return {
      success: true,
      data: horas,
    };
  }

  // ==================== COMPARATIVOS ====================

  @Get('comparativo')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Comparativo de ventas entre periodos',
    description:
      'Compara ventas entre dos periodos (día vs día anterior, semana vs semana anterior, mes vs mes anterior, año vs año anterior). Incluye: totales de ventas, número de órdenes, tickets promedio, variación porcentual y en monto, tendencia (crecimiento/decrecimiento/estable), interpretación automática, detalle día por día. Esencial para análisis de tendencias y evaluación de estrategias.',
  })
  @ApiQuery({
    name: 'periodo',
    required: false,
    enum: ['dia', 'semana', 'mes', 'anio'],
    description: 'Tipo de periodo a comparar',
    example: 'mes',
  })
  @ApiQuery({
    name: 'fecha_base',
    required: false,
    description: 'Fecha base para comparación (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparativo generado exitosamente',
  })
  async getComparativo(@Query() query: QueryComparativoDto) {
    const comparativo = await this.reportesService.getComparativo(query);
    return {
      success: true,
      data: comparativo,
    };
  }

  // ==================== TENDENCIAS ====================

  @Get('tendencias/dia-semana')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Tendencias por día de la semana',
    description:
      'Análisis histórico de ventas por día de semana (Lunes-Domingo). Promedios de: ventas totales, órdenes, mesas atendidas, ticket promedio. Clasificación de días (DIA_FUERTE/DIA_NORMAL/DIA_DEBIL). Identifica patrones semanales para: planificación de inventario, ajuste de personal, estrategias promocionales específicas por día.',
  })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_fin', required: false })
  @ApiResponse({
    status: 200,
    description: 'Análisis de tendencias completado',
  })
  async getTendenciasDiaSemana(@Query() query: QueryReportesBaseDto) {
    const tendencias = await this.reportesService.getTendenciasDiaSemana(query);
    return {
      success: true,
      data: tendencias,
    };
  }

  // ==================== INVENTARIO ====================

  @Get('inventario/critico')
  @Roles('Administrador', 'Gerente', 'Chef')
  @ApiOperation({
    summary: 'Productos con inventario crítico',
    description:
      'Lista de productos con stock bajo/crítico/agotado. Incluye: stock actual vs mínimo vs punto reorden, días de inventario estimados (basado en consumo promedio 30 días), estado (SIN_STOCK/CRITICO/REORDEN), prioridad de reorden (CRITICO/URGENTE/ALTO/NORMAL), costo de reposición. Alertas automáticas. Crítico para evitar quiebres de stock.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos con stock crítico',
  })
  async getInventarioCritico() {
    const inventario = await this.reportesService.getInventarioCritico();
    return {
      success: true,
      data: inventario,
    };
  }

  @Get('inventario/sugerencias-compra')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Sugerencias automáticas de compra',
    description:
      'Genera órdenes de compra sugeridas basadas en: consumo promedio histórico, stock actual, punto de reorden, días de inventario disponible. Calcula cantidad recomendada y costo estimado. Prioriza por urgencia (URGENTE/PRONTO/NORMAL). Considera: tendencias de consumo, estacionalidad, lead time proveedores. Optimiza inventario evitando excesos y faltantes.',
  })
  @ApiQuery({
    name: 'dias_analisis',
    required: false,
    type: Number,
    description: 'Días a analizar para calcular consumo promedio',
    example: 30,
  })
  @ApiQuery({
    name: 'prioridad',
    required: false,
    enum: ['URGENTE', 'PRONTO', 'NORMAL'],
    description: 'Filtrar por prioridad',
  })
  @ApiQuery({
    name: 'stock_maximo',
    required: false,
    type: Number,
    description: 'Filtrar productos con stock <= valor',
  })
  @ApiResponse({
    status: 200,
    description: 'Sugerencias de compra generadas',
  })
  async getSugerenciasCompra(@Query() query: SugerenciasCompraDto) {
    const sugerencias = await this.reportesService.getSugerenciasCompra(query);
    return {
      success: true,
      data: sugerencias,
    };
  }

  @Get('inventario/proyeccion')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Proyección de agotamiento de inventario',
    description:
      'Predice cuándo se agotará cada producto basado en consumo promedio diario. Calcula: días hasta agotarse, fecha estimada de agotamiento. Genera alertas (se agota en <1 semana, <2 semanas). Permite planificación proactiva de compras. Previene quiebres de stock.',
  })
  @ApiQuery({
    name: 'id_producto',
    required: false,
    type: Number,
    description: 'Proyección de producto específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Proyección de inventario calculada',
  })
  async getProyeccionInventario(@Query('id_producto') idProducto?: string) {
    const id = idProducto ? parseInt(idProducto, 10) : undefined;
    const proyeccion = await this.reportesService.getProyeccionInventario(id);
    return {
      success: true,
      data: proyeccion,
    };
  }

  // ==================== MESAS ====================

  @Get('mesas/estado')
  @Roles('Administrador', 'Gerente', 'Mesero')
  @ApiOperation({
    summary: 'Estado actual de todas las mesas',
    description:
      'Vista en tiempo real de todas las mesas: estado (Disponible/Ocupada/Reservada/Por Limpiar), capacidad, número de comensales actuales, cliente, mesero asignado, consumo actual, número de órdenes, minutos ocupada. Resumen: total mesas, ocupadas, disponibles, % ocupación, capacidad total vs comensales actuales. Actualización recomendada: cada 30 segundos. Pantalla principal de host/hostess.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de mesas obtenido',
  })
  async getEstadoMesas() {
    const estado = await this.reportesService.getEstadoMesas();
    return {
      success: true,
      data: estado,
    };
  }

  // ==================== UTILIDADES ====================

  @Get('refresh-vistas')
  @Roles('Administrador')
  @ApiOperation({
    summary: 'Refrescar vistas materializadas',
    description:
      'Actualiza manualmente las vistas materializadas (mv_analisis_ventas). Mejora performance de reportes pesados. Normalmente se ejecuta automáticamente cada 6 horas vía cron. Usar manualmente solo cuando: se requiere data en tiempo real, después de grandes cargas de datos, antes de presentaciones ejecutivas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Vistas materializadas actualizadas',
  })
  async refreshMaterializedViews() {
    const result = await this.reportesService.refreshMaterializedViews();
    return {
      success: true,
      message: 'Vistas materializadas actualizadas exitosamente',
      data: result,
    };
  }

  // ==================== ENDPOINTS DE BÚSQUEDA RÁPIDA ====================

  @Get('busqueda/producto/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Reporte rápido de un producto específico',
    description:
      'Resumen ejecutivo de un producto: ventas últimos 30 días, tendencia, rentabilidad, posición en ranking, comparación vs promedio categoría.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte del producto generado',
  })
  async getReporteProducto(@Param('id', ParseIntPipe) id: number) {
    // Obtener múltiples reportes del producto
    const [top, rentabilidad] = await Promise.all([
      this.reportesService.getProductosTop({
        limit: 100,
        fecha_inicio: new Date(
          new Date().setDate(new Date().getDate() - 30),
        ).toISOString(),
      }),
      this.reportesService.getAnalisisRentabilidad({
        limit: 100,
        fecha_inicio: new Date(
          new Date().setDate(new Date().getDate() - 30),
        ).toISOString(),
      }),
    ]);

    const productoTop = top.productos.find((p) => p.id_producto === id);
    const productoRentabilidad = rentabilidad.productos.find(
      (p) => p.id_producto === id,
    );

    if (!productoTop && !productoRentabilidad) {
      return {
        success: false,
        message: 'Producto no encontrado o sin ventas en el periodo',
      };
    }

    return {
      success: true,
      data: {
        producto: productoTop || productoRentabilidad,
        ranking: {
          posicion: top.productos.findIndex((p) => p.id_producto === id) + 1,
          total_productos: top.productos.length,
        },
        rentabilidad: productoRentabilidad,
      },
    };
  }

  @Get('busqueda/mesero/:id')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Reporte rápido de un mesero específico',
    description:
      'Resumen ejecutivo de desempeño de mesero: ventas, propinas, eficiencia.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del mesero',
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte del mesero generado',
  })
  async getReporteMesero(@Param('id', ParseIntPipe) id: number) {
    const analisis = await this.reportesService.getAnalisisMesero({
      id_mesero: id,
      fecha_inicio: new Date(
        new Date().setDate(new Date().getDate() - 30),
      ).toISOString(),
    });

    if (analisis.meseros.length === 0) {
      return {
        success: false,
        message: 'Mesero no encontrado o sin actividad en el periodo',
      };
    }

    return {
      success: true,
      data: analisis.meseros[0],
    };
  }

  // ==================== EXPORTACIONES ====================
  @Get('export/ventas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Exportar reporte de ventas (preparado para CSV/Excel)',
    description:
      'Retorna datos de ventas en formato aplanado, listo para exportación a Excel/CSV. Incluye todos los campos relevantes sin anidamiento.',
  })
  @ApiQuery({ name: 'fecha_inicio', required: false })
  @ApiQuery({ name: 'fecha_fin', required: false })
  @ApiQuery({ name: 'agrupar_por', required: false })
  @ApiResponse({
    status: 200,
    description: 'Datos listos para exportación',
  })
  async exportarVentas(@Query() query: QueryVentasDto) {
    const reporte = await this.reportesService.getReporteVentas(query);

    // ✅ FIX: Verificar si tiene la propiedad 'datos'
    let datosExportacion: any[] = [];

    if ('datos' in reporte && Array.isArray(reporte.datos)) {
      datosExportacion = reporte.datos.map((item: any) => ({
        fecha: item.fecha || '',
        dia_semana: item.dia_semana || '',
        hora: item.hora || '',
        total_ordenes: item.total_ordenes || 0,
        subtotal: item.subtotal || 0,
        descuentos: item.descuentos || 0,
        iva: item.iva || 0,
        propinas: item.propinas || 0,
        total_ventas: item.total_ventas || 0,
        ticket_promedio: item.ticket_promedio || 0,
        mesas_atendidas: item.mesas_atendidas || 0,
      }));
    } else if ('resumen' in reporte) {
      // Si es resumen, exportar ese dato
      datosExportacion = [reporte.resumen];
    }

    return {
      success: true,
      data: datosExportacion,
      metadata: {
        total_registros: datosExportacion.length,
        periodo: reporte.periodo,
        fecha_exportacion: new Date(),
      },
    };
  }

  // ==================== RESÚMENES EJECUTIVOS ====================

  @Get('resumen/semanal')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Resumen ejecutivo semanal',
    description:
      'Reporte consolidado de la semana: ventas totales, comparación vs semana anterior, top 5 productos, mejor mesero, día de mayor venta, alertas críticas. Formato ejecutivo para reporte gerencial.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen semanal generado',
  })
  async getResumenSemanal() {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    const [
      ventas,
      comparativo,
      productosTop,
      meseros,
      tendenciaDias,
      inventarioCritico,
    ] = await Promise.all([
      this.reportesService.getReporteVentas({
        fecha_inicio: inicioSemana.toISOString(),
        fecha_fin: hoy.toISOString(),
        agrupar_por: undefined, // ✅ Asegurar que devuelva resumen
      }),
      this.reportesService.getComparativo({
        periodo: 'semana' as any,
        fecha_base: hoy.toISOString(),
      }),
      this.reportesService.getProductosTop({
        limit: 5,
        fecha_inicio: inicioSemana.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
      this.reportesService.getAnalisisMesero({
        fecha_inicio: inicioSemana.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
      this.reportesService.getTendenciasDiaSemana({
        fecha_inicio: inicioSemana.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
      this.reportesService.getInventarioCritico(),
    ]);

    // ✅ FIX: Extraer resumen de manera segura
    const ventasData = 'resumen' in ventas ? ventas.resumen : ventas;

    return {
      success: true,
      data: {
        periodo: {
          inicio: inicioSemana,
          fin: hoy,
          tipo: 'Semana',
        },
        ventas: ventasData,
        comparativo: comparativo.comparacion,
        top_productos: productosTop.productos.slice(0, 5),
        mejor_mesero: meseros.meseros[0],
        mejor_dia: tendenciaDias.dias.sort(
          (a: any, b: any) => b.total_ventas - a.total_ventas,
        )[0],
        alertas: {
          inventario_critico: inventarioCritico.total_productos_criticos,
          productos_sin_stock: inventarioCritico.sin_stock,
        },
      },
    };
  }

  @Get('resumen/mensual')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Resumen ejecutivo mensual',
    description:
      'Reporte consolidado del mes: ventas, comparativos, tendencias, performance meseros, productos estrella, análisis de rentabilidad. Formato ejecutivo completo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen mensual generado',
  })
  async getResumenMensual() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [
      ventas,
      comparativo,
      productosTop,
      rentabilidad,
      meseros,
      horasPico,
    ] = await Promise.all([
      this.reportesService.getReporteVentas({
        fecha_inicio: inicioMes.toISOString(),
        fecha_fin: hoy.toISOString(),
        agrupar_por: undefined, // ✅ Asegurar que devuelva resumen
      }),
      this.reportesService.getComparativo({
        periodo: 'mes' as any,
        fecha_base: hoy.toISOString(),
      }),
      this.reportesService.getProductosTop({
        limit: 10,
        fecha_inicio: inicioMes.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
      this.reportesService.getAnalisisRentabilidad({
        fecha_inicio: inicioMes.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
      this.reportesService.getAnalisisMesero({
        fecha_inicio: inicioMes.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
      this.reportesService.getHorasPico({
        fecha_inicio: inicioMes.toISOString(),
        fecha_fin: hoy.toISOString(),
      }),
    ]);

    // ✅ FIX: Extraer resumen de manera segura
    const ventasData = 'resumen' in ventas ? ventas.resumen : ventas;

    return {
      success: true,
      data: {
        periodo: {
          mes: hoy.getMonth() + 1,
          anio: hoy.getFullYear(),
          dias_transcurridos: hoy.getDate(),
        },
        ventas: ventasData,
        comparativo: comparativo,
        top_10_productos: productosTop.productos,
        rentabilidad: {
          resumen: rentabilidad.resumen,
          top_5_rentables: rentabilidad.productos.slice(0, 5),
        },
        desempeno_meseros: meseros.meseros,
        horas_pico: horasPico.horas_pico.slice(0, 5),
      },
    };
  }
}
