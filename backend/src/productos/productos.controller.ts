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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('productos')
@ApiBearerAuth('JWT-auth')
@Controller('productos')
@UseGuards(JwtAuthGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductoDto: CreateProductoDto) {
    const producto = await this.productosService.create(createProductoDto);
    return {
      success: true,
      message: 'Producto creado exitosamente',
      data: producto,
    };
  }

  @Get()
  async findAll(@Query() query: QueryProductosDto) {
    const result = await this.productosService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('activos')
  async findActivos(@Query() query: QueryProductosDto) {
    const result = await this.productosService.findActivos(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('buscar')
  async search(@Query('q') searchTerm: string) {
    const productos = await this.productosService.search(searchTerm);
    return {
      success: true,
      data: productos,
    };
  }

  @Get('por-categoria/:categoriaId')
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
  async getEstadisticas() {
    const stats = await this.productosService.getEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.findOne(id);
    return {
      success: true,
      data: producto,
    };
  }

  @Patch(':id')
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
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productosService.remove(id);
    return {
      success: true,
      message: 'Producto eliminado exitosamente',
    };
  }

  @Post(':id/activar')
  async activar(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.activar(id);
    return {
      success: true,
      message: 'Producto activado exitosamente',
      data: producto,
    };
  }

  @Post(':id/desactivar')
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    const producto = await this.productosService.desactivar(id);
    return {
      success: true,
      message: 'Producto desactivado exitosamente',
      data: producto,
    };
  }
}
