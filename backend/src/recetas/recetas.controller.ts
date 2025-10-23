/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CrearRecetaDto } from './dto/crear-receta.dto';
import { ActualizarRecetaDto } from './dto/actualizar-receta.dto';
import { AgregarInsumoDto } from './dto/agregar-insumo.dto';
import { QueryRecetasDto } from './dto/query-recetas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Recetas / BOM')
@ApiBearerAuth('JWT-auth')
@Controller('recetas')
@UseGuards(JwtAuthGuard)
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear receta completa',
    description:
      'Crea una nueva receta (Bill of Materials) para un producto. Define todos los insumos necesarios, cantidades, unidades de medida y merma esperada. Calcula automáticamente el costo del producto basado en costos de insumos. Usado para productos elaborados en cocina.',
  })
  @ApiResponse({
    status: 201,
    description: 'Receta creada exitosamente con cálculo de costos',
  })
  @ApiResponse({
    status: 400,
    description: 'Producto no válido o insumos incorrectos',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una receta para este producto',
  })
  async crear(@Body() crearRecetaDto: CrearRecetaDto) {
    const receta = await this.recetasService.crear(crearRecetaDto);
    return {
      success: true,
      message: 'Receta creada exitosamente',
      data: receta,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las recetas',
    description:
      'Obtiene lista de todas las recetas con filtros opcionales. Puede filtrar por producto final o buscar qué recetas usan un insumo específico. Incluye información de costos si se solicita. Usado para gestión de recetas y análisis de costos.',
  })
  @ApiQuery({
    name: 'id_producto_final',
    required: false,
    description: 'Filtrar por producto final',
  })
  @ApiQuery({
    name: 'id_insumo',
    required: false,
    description: 'Buscar recetas que usen este insumo',
  })
  @ApiQuery({
    name: 'con_costo',
    required: false,
    description: 'Incluir cálculo de costos',
  })
  async findAll(@Query() query: QueryRecetasDto) {
    const recetas = await this.recetasService.findAll(query);
    return {
      success: true,
      data: recetas,
      total: recetas.length,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener receta de un producto',
    description:
      'Retorna la receta completa de un producto específico: todos los insumos, cantidades, unidades, notas de preparación. Incluye análisis de costos: costo total de insumos, precio de venta, margen de utilidad, ganancia unitaria. Usado para consulta detallada y análisis de rentabilidad.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto final',
  })
  @ApiResponse({
    status: 200,
    description: 'Receta encontrada con análisis de costos',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado o sin receta',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const receta = await this.recetasService.findOne(id);
    return {
      success: true,
      data: receta,
    };
  }

  @Post(':id/insumos')
  @ApiOperation({
    summary: 'Agregar insumo a receta existente',
    description:
      'Agrega un nuevo insumo a una receta ya creada. Valida que el insumo no esté duplicado. Recalcula automáticamente el costo del producto. Usado para actualizar recetas con nuevos ingredientes.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto final',
  })
  @ApiResponse({
    status: 201,
    description: 'Insumo agregado y costos recalculados',
  })
  @ApiResponse({
    status: 409,
    description: 'El insumo ya existe en la receta',
  })
  async agregarInsumo(
    @Param('id', ParseIntPipe) id: number,
    @Body() agregarInsumoDto: AgregarInsumoDto,
  ) {
    const insumo = await this.recetasService.agregarInsumo(
      id,
      agregarInsumoDto,
    );
    return {
      success: true,
      message: 'Insumo agregado exitosamente',
      data: insumo,
    };
  }

  @Patch('insumos/:idInsumo')
  @ApiOperation({
    summary: 'Actualizar insumo en receta',
    description:
      'Modifica cantidad, unidad de medida, merma o notas de un insumo existente. Recalcula costos del producto automáticamente. Usado para ajustar recetas según cambios en proceso de producción.',
  })
  @ApiParam({
    name: 'idInsumo',
    description: 'ID del registro de insumo en la receta',
  })
  @ApiResponse({
    status: 200,
    description: 'Insumo actualizado y costos recalculados',
  })
  async actualizarInsumo(
    @Param('idInsumo', ParseIntPipe) idInsumo: number,
    @Body() actualizarDto: Partial<AgregarInsumoDto>,
  ) {
    const insumo = await this.recetasService.actualizarInsumo(
      idInsumo,
      actualizarDto,
    );
    return {
      success: true,
      message: 'Insumo actualizado exitosamente',
      data: insumo,
    };
  }

  @Delete('insumos/:idInsumo')
  @ApiOperation({
    summary: 'Eliminar insumo de receta',
    description:
      'Remueve un insumo específico de la receta. Recalcula costos del producto automáticamente. Usado para simplificar recetas o eliminar ingredientes discontinuados.',
  })
  @ApiParam({
    name: 'idInsumo',
    description: 'ID del registro de insumo en la receta',
  })
  @ApiResponse({
    status: 200,
    description: 'Insumo eliminado y costos recalculados',
  })
  async eliminarInsumo(@Param('idInsumo', ParseIntPipe) idInsumo: number) {
    const resultado = await this.recetasService.eliminarInsumo(idInsumo);
    return {
      success: true,
      message: resultado.mensaje,
      data: resultado,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar receta completa',
    description:
      'Elimina toda la receta de un producto, incluyendo todos sus insumos. Limpia las notas de receta del producto. Usado cuando un producto deja de elaborarse internamente o cambia completamente su proceso.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto final',
  })
  @ApiResponse({
    status: 200,
    description: 'Receta eliminada completamente',
  })
  async eliminarReceta(@Param('id', ParseIntPipe) id: number) {
    const resultado = await this.recetasService.eliminarReceta(id);
    return {
      success: true,
      message: resultado.mensaje,
      data: resultado,
    };
  }

  @Get(':id/explosion')
  @ApiOperation({
    summary: 'Explosión de materiales (BOM Explosion)',
    description:
      'Calcula todos los insumos necesarios para producir X cantidad de producto. Incluye: cantidad total por insumo (con merma), stock actual disponible, faltantes, costos totales. Valida si es posible producir con inventario actual. Usado para planificación de producción y compras.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a producir',
  })
  @ApiQuery({
    name: 'cantidad',
    required: false,
    description: 'Cantidad a producir (default: 1)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis de materiales necesarios completado',
  })
  async explosionMateriales(
    @Param('id', ParseIntPipe) id: number,
    @Query('cantidad') cantidad?: string,
  ) {
    const cantidadNumero = cantidad ? parseFloat(cantidad) : 1;
    const explosion = await this.recetasService.explosionMateriales(
      id,
      cantidadNumero,
    );
    return {
      success: true,
      data: explosion,
    };
  }

  @Get('insumos/:id/implosion')
  @ApiOperation({
    summary: 'Implosión de materiales (Where-Used)',
    description:
      'Encuentra en qué productos/recetas se usa un insumo específico. Muestra cantidad necesaria por producto y porcentaje de merma. Útil para: impacto de cambio de precio de insumo, discontinuación de productos, análisis de dependencias.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del insumo a analizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos que usan el insumo',
  })
  async implosionMateriales(@Param('id', ParseIntPipe) id: number) {
    const implosion = await this.recetasService.implosionMateriales(id);
    return {
      success: true,
      data: implosion,
    };
  }

  @Get(':id/analisis-costos')
  @ApiOperation({
    summary: 'Análisis detallado de costos',
    description:
      'Genera reporte completo de costos del producto: desglose por insumo, porcentaje de cada insumo sobre costo total, margen de utilidad actual, punto de equilibrio, sugerencias de optimización. Usado para análisis financiero y pricing.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a analizar',
  })
  async analisisCostos(@Param('id', ParseIntPipe) id: number) {
    const receta = await this.recetasService.findOne(id);

    // Calcular desglose porcentual de cada insumo
    const costoTotal = receta.analisis_costos.costo_total_insumos;
    const desglose = receta.insumos.map((insumo) => {
      const cantidad = Number(insumo.cantidad_necesaria);
      const merma = 1 + Number(insumo.merma_esperada_porcentaje) / 100;
      const costo = Number(
        insumo.productos_receta_insumos_id_insumoToproductos.costo_promedio ||
          0,
      );
      const costoInsumo = cantidad * merma * costo;
      const porcentaje = costoTotal > 0 ? (costoInsumo / costoTotal) * 100 : 0;

      return {
        nombre: insumo.productos_receta_insumos_id_insumoToproductos.nombre,
        cantidad_necesaria: cantidad,
        unidad: insumo.unidades_medida.abreviatura,
        costo_unitario: costo,
        costo_total: costoInsumo,
        porcentaje_costo: porcentaje.toFixed(2),
      };
    });

    // Ordenar por costo descendente
    desglose.sort((a, b) => b.costo_total - a.costo_total);

    return {
      success: true,
      data: {
        producto: receta.producto,
        analisis_costos: receta.analisis_costos,
        desglose_insumos: desglose,
        recomendaciones: this.generarRecomendaciones(
          Number(receta.analisis_costos.margen_utilidad_porcentaje),
          desglose,
        ),
      },
    };
  }

  @Post(':id/simular-precio')
  @ApiOperation({
    summary: 'Simular cambio de precio',
    description:
      'Simula cómo un cambio en precio de venta afectaría el margen de utilidad. Calcula nuevo margen, ganancia unitaria y porcentaje de cambio. Usado para estrategia de pricing y análisis de sensibilidad.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto',
  })
  @ApiQuery({
    name: 'nuevo_precio',
    description: 'Nuevo precio de venta a simular',
    example: 150.0,
  })
  async simularPrecio(
    @Param('id', ParseIntPipe) id: number,
    @Query('nuevo_precio') nuevoPrecio: string,
  ) {
    const receta = await this.recetasService.findOne(id);
    const precioActual = Number(receta.producto.precio_venta);
    const costoTotal = Number(receta.analisis_costos.costo_total_insumos);
    const precioNuevo = parseFloat(nuevoPrecio);

    const margenActual = ((precioActual - costoTotal) / precioActual) * 100;
    const margenNuevo = ((precioNuevo - costoTotal) / precioNuevo) * 100;

    return {
      success: true,
      data: {
        producto: receta.producto.nombre,
        precio_actual: precioActual,
        precio_simulado: precioNuevo,
        costo_producto: costoTotal,
        margen_actual: margenActual.toFixed(2) + '%',
        margen_simulado: margenNuevo.toFixed(2) + '%',
        ganancia_actual: precioActual - costoTotal,
        ganancia_simulada: precioNuevo - costoTotal,
        cambio_porcentual:
          (((precioNuevo - precioActual) / precioActual) * 100).toFixed(2) +
          '%',
        recomendacion:
          margenNuevo < 30
            ? 'Margen bajo. Considere aumentar precio o reducir costos.'
            : margenNuevo > 60
              ? 'Margen alto. Precio competitivo con buena rentabilidad.'
              : 'Margen aceptable para operación rentable.',
      },
    };
  }

  // Método privado para generar recomendaciones
  private generarRecomendaciones(margen: number, desglose: any[]): string[] {
    const recomendaciones: string[] = [];

    if (margen < 30) {
      recomendaciones.push(
        '⚠️ Margen de utilidad bajo (<30%). Considere aumentar precio de venta.',
      );
    }

    if (margen < 20) {
      recomendaciones.push(
        '🔴 Margen crítico (<20%). Revise costos de insumos o ajuste precio urgentemente.',
      );
    }

    if (desglose.length > 0 && parseFloat(desglose[0].porcentaje_costo) > 40) {
      recomendaciones.push(
        `💡 El insumo "${desglose[0].nombre}" representa más del 40% del costo. Busque proveedores alternativos.`,
      );
    }

    if (margen > 60) {
      recomendaciones.push(
        '✅ Excelente margen (>60%). Considere estrategia de precios competitivos.',
      );
    }

    if (recomendaciones.length === 0) {
      recomendaciones.push(
        '✅ Margen saludable. Continúe monitoreando costos de insumos.',
      );
    }

    return recomendaciones;
  }
}
