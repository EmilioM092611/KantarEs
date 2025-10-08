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
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Productos')
@ApiBearerAuth('JWT-auth')
@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo producto' })
  async create(@Body() createProductoDto: CreateProductoDto) {
    const producto = await this.productosService.create(createProductoDto);
    return {
      success: true,
      message: 'Producto creado exitosamente',
      data: producto,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  async findAll(@Query() q: QueryProductosDto) {
    try {
      return await this.productosService.findAll(q);
    } catch (e) {
      // DEBUG: imprime detalle real en consola
      console.error('GET /productos ERROR:', e);
      throw e;
    }
  }

  @Get('activos')
  @ApiOperation({ summary: 'Listar solo productos activos' })
  async findActivos(@Query() query: QueryProductosDto) {
    const result = await this.productosService.findActivos(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar productos especificos' })
  async search(@Query('q') searchTerm: string) {
    const productos = await this.productosService.search(searchTerm);
    return {
      success: true,
      data: productos,
    };
  }

  @Get('por-categoria/:categoriaId')
  @ApiOperation({ summary: 'Buscar productos por categoría' })
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
  @ApiOperation({ summary: 'Listar estadisticas de productos' })
  async getEstadisticas() {
    const stats = await this.productosService.getEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.findOne(id);
    return {
      success: true,
      data: producto,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
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
  @ApiOperation({ summary: 'Eliminar producto' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productosService.remove(id);
    return {
      success: true,
      message: 'Producto eliminado exitosamente',
    };
  }

  @Post(':id/activar')
  @ApiOperation({ summary: 'Activar producto' })
  async activar(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.activar(id);
    return {
      success: true,
      message: 'Producto activado exitosamente',
      data: producto,
    };
  }

  @Post(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar producto' })
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.desactivar(id);
    return {
      success: true,
      message: 'Producto desactivado exitosamente',
      data: producto,
    };
  }
}
