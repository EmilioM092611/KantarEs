import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductosDto } from './dto/query-productos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Productos')
@ApiBearerAuth('JWT-auth')
@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Producto con ese SKU ya existe',
  })
  async create(@Body() createProductoDto: CreateProductoDto) {
    const producto = await this.productosService.create(createProductoDto);
    return {
      success: true,
      message: 'Producto creado exitosamente',
      data: producto,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos con paginación',
  })
  async findAll(@Query() query: QueryProductosDto) {
    const result = await this.productosService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('activos')
  @ApiOperation({ summary: 'Listar solo productos activos y disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Productos activos y disponibles',
  })
  async findActivos(@Query() query: QueryProductosDto) {
    const result = await this.productosService.findActivos(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar productos por nombre o SKU' })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda',
  })
  async search(@Query('q') searchTerm: string) {
    const productos = await this.productosService.search(searchTerm);
    return {
      success: true,
      data: productos,
    };
  }

  @Get('por-categoria/:categoriaId')
  @ApiOperation({ summary: 'Listar productos por categoría' })
  @ApiResponse({
    status: 200,
    description: 'Productos de la categoría especificada',
  })
  async findByCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Query() query: QueryProductosDto,
  ) {
    const result = await this.productosService.findByCategoria(
      categoriaId,
      query,
    );
    return {
      success: true,
      ...result,
    };
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas generales de productos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas: total, activos, inactivos, bajo stock, etc.',
  })
  async getEstadisticas() {
    const stats = await this.productosService.getEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID con detalles completos' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del producto',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.findOne(id);
    return {
      success: true,
      data: producto,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    const producto = await this.productosService.update(id, updateProductoDto);
    return {
      success: true,
      message: 'Producto actualizado exitosamente',
      data: producto,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productosService.remove(id);
    return {
      success: true,
      message: 'Producto eliminado exitosamente',
    };
  }

  @Post(':id/activar')
  @ApiOperation({ summary: 'Activar un producto desactivado' })
  @ApiResponse({
    status: 200,
    description: 'Producto activado',
  })
  async activar(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.activar(id);
    return {
      success: true,
      message: 'Producto activado exitosamente',
      data: producto,
    };
  }

  @Post(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar un producto temporalmente' })
  @ApiResponse({
    status: 200,
    description: 'Producto desactivado',
  })
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.desactivar(id);
    return {
      success: true,
      message: 'Producto desactivado exitosamente',
      data: producto,
    };
  }

  // === MEJORA 6: Endpoints para Recetas (BOM) ===
  // Nota: La implementación completa está en RecetasModule
  // Aquí solo documentamos las rutas anidadas que se usarán

  /**
   * NOTA: Las rutas completas de recetas están en:
   * GET    /productos/:id/receta          - Obtener receta completa
   * POST   /productos/:id/receta          - Crear/actualizar receta
   * DELETE /productos/:id/receta/:insumo  - Eliminar insumo de receta
   *
   * NOTA: Las rutas completas de combos están en:
   * GET    /productos/:id/combos          - Obtener componentes del combo
   * POST   /productos/:id/combos          - Añadir componente al combo
   * DELETE /productos/:id/combos/:componente - Eliminar componente
   *
   * Estos endpoints se implementan en RecetasModule y CombosModule
   * para mejor separación de responsabilidades.
   */
}
