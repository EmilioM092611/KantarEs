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
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Categorias')
@ApiBearerAuth('JWT-auth')
@Controller('categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva categoria' })
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    const categoria = await this.categoriasService.create(createCategoriaDto);
    return {
      success: true,
      message: 'Categoría creada exitosamente',
      data: categoria,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las categorias' })
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
  @ApiOperation({ summary: 'Obtener categorias con productos asociados' })
  async findAllWithProducts() {
    const categorias = await this.categoriasService.findAllWithProductCount();
    return {
      success: true,
      data: categorias,
    };
  }

  @Get('menu')
  @ApiOperation({ summary: 'Obtener categorias del menu' })
  async getForMenu() {
    const categorias = await this.categoriasService.getCategoriasMenu();
    return {
      success: true,
      data: categorias,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoria por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriasService.findOne(id);
    return {
      success: true,
      data: categoria,
    };
  }

  @Get(':id/productos')
  @ApiOperation({ summary: 'Obtener categoria por ID de producto' })
  async getProductos(@Param('id', ParseIntPipe) id: number) {
    const productos = await this.categoriasService.getProductosByCategoria(id);
    return {
      success: true,
      data: productos,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoria' })
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
  @ApiOperation({ summary: 'Eliminar categoria' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriasService.remove(id);
    return {
      success: true,
      message: 'Categoría eliminada exitosamente',
    };
  }

  @Post(':id/activar')
  @ApiOperation({ summary: 'Activar categoria' })
  async activar(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriasService.activar(id);
    return {
      success: true,
      message: 'Categoría activada exitosamente',
      data: categoria,
    };
  }

  @Post(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar categoria' })
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    const categoria = await this.categoriasService.desactivar(id);
    return {
      success: true,
      message: 'Categoría desactivada exitosamente',
      data: categoria,
    };
  }

  @Patch('reordenar')
  @ApiOperation({ summary: 'Reordenar categorias' })
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
