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
  HttpStatus,
  HttpCode,
  Query,
  Put,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Categorias')
@ApiBearerAuth('JWT-auth')
@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva categoría',
    description:
      'Crea una nueva categoría de productos con opción de categoría padre para jerarquías',
  })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una categoría con ese nombre',
  })
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    const categoria = await this.categoriasService.create(createCategoriaDto);
    return {
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoria,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas las categorías',
    description:
      'Obtiene todas las categorías con opción de filtrar por estado activo',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    description: 'Filtrar por categorías activas (true) o inactivas (false)',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  async findAll(@Query('activo') activo?: string) {
    const categorias = await this.categoriasService.findAll(
      activo === 'true' ? true : activo === 'false' ? false : undefined,
    );
    return {
      success: true,
      data: categorias,
    };
  }

  @Get('con-productos')
  @ApiOperation({
    summary: 'Obtener categorías con contador de productos',
    description:
      'Lista todas las categorías incluyendo el número de productos asociados a cada una',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías con conteo de productos',
  })
  async findAllWithProducts() {
    const categorias = await this.categoriasService.findAllWithProductCount();
    return {
      success: true,
      data: categorias,
    };
  }

  @Get('menu')
  @ApiOperation({
    summary: 'Obtener categorías para el menú',
    description:
      'Obtiene solo las categorías visibles y ordenadas para mostrar en el menú',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías del menú ordenadas',
  })
  async getForMenu() {
    const categorias = await this.categoriasService.getCategoriasMenu();
    return {
      success: true,
      data: categorias,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener categoría por ID',
    description: 'Obtiene los detalles completos de una categoría específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriasService.findOne(id);
    return {
      success: true,
      data: categoria,
    };
  }

  @Get(':id/productos')
  @ApiOperation({
    summary: 'Obtener productos de una categoría',
    description:
      'Lista todos los productos activos asociados a una categoría específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Productos de la categoría',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async getProductos(@Param('id', ParseIntPipe) id: number) {
    const productos = await this.categoriasService.getProductosByCategoria(id);
    return {
      success: true,
      data: productos,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar categoría',
    description: 'Actualiza los datos de una categoría existente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otra categoría con ese nombre',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
  ) {
    const categoria = await this.categoriasService.update(
      id,
      updateCategoriaDto,
    );
    return {
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoria,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar categoría (soft delete)',
    description: 'Desactiva una categoría sin eliminarla físicamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriasService.remove(id);
    return {
      success: true,
      message: 'Categoría eliminada exitosamente',
    };
  }

  @Post(':id/activar')
  @ApiOperation({
    summary: 'Activar categoría',
    description: 'Reactiva una categoría previamente desactivada',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría activada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async activar(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriasService.activar(id);
    return {
      success: true,
      message: 'Categoría activada exitosamente',
      data: categoria,
    };
  }

  @Post(':id/desactivar')
  @ApiOperation({
    summary: 'Desactivar categoría',
    description: 'Desactiva temporalmente una categoría',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la categoría',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Categoría desactivada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriasService.desactivar(id);
    return {
      success: true,
      message: 'Categoría desactivada exitosamente',
      data: categoria,
    };
  }

  @Patch('reordenar')
  @ApiOperation({
    summary: 'Reordenar categorías',
    description: 'Actualiza el orden de visualización de múltiples categorías',
  })
  @ApiResponse({
    status: 200,
    description: 'Categorías reordenadas exitosamente',
  })
  async reordenar(
    @Body() body: { categorias: { id: number; orden: number }[] },
  ) {
    await this.categoriasService.reordenarCategorias(body.categorias);
    return {
      success: true,
      message: 'Categorías reordenadas exitosamente',
    };
  }
}
