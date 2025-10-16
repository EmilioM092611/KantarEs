// backend/src/tipos-producto/tipos-producto.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { TiposProductoService } from './tipos-producto.service';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { QueryTiposProductoDto } from './dto/query-tipos-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Tipos de Producto')
@ApiBearerAuth('JWT-auth')
@Controller('tipos-producto')
@UseGuards(JwtAuthGuard)
export class TiposProductoController {
  constructor(private readonly tiposProductoService: TiposProductoService) {}

  // === MEJORA 7: CRUD completo de catálogos menores ===

  @Get()
  @ApiOperation({
    summary: 'Listar todos los tipos de producto con filtros',
    description:
      'Obtiene tipos de producto filtrados por estado activo y área de preparación',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de producto',
  })
  async findAll(@Query() query: QueryTiposProductoDto) {
    const tipos = await this.tiposProductoService.findAll(query);
    return {
      success: true,
      data: tipos,
      count: tipos.length,
    };
  }

  @Get('activos')
  @ApiOperation({
    summary: 'Listar solo tipos de producto activos',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipos de producto activos',
  })
  async findActivos() {
    const tipos = await this.tiposProductoService.findActivos();
    return {
      success: true,
      data: tipos,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un tipo de producto por ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo de producto encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tipo = await this.tiposProductoService.findOne(id);
    return {
      success: true,
      data: tipo,
    };
  }

  @Get(':id/categorias')
  @ApiOperation({
    summary: 'Obtener categorías asociadas a este tipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías del tipo',
  })
  async getCategorias(@Param('id', ParseIntPipe) id: number) {
    const categorias = await this.tiposProductoService.getCategorias(id);
    return {
      success: true,
      data: categorias,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo tipo de producto',
    description: 'Valida que el nombre sea único (case-insensitive)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tipo creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un tipo con ese nombre',
  })
  async create(@Body() createTipoDto: CreateTipoProductoDto) {
    const tipo = await this.tiposProductoService.create(createTipoDto);
    return {
      success: true,
      message: 'Tipo de producto creado exitosamente',
      data: tipo,
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar tipo de producto completo',
    description: 'Actualiza todos los campos del tipo',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe otro tipo con ese nombre',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoDto: UpdateTipoProductoDto,
  ) {
    const tipo = await this.tiposProductoService.update(id, updateTipoDto);
    return {
      success: true,
      message: 'Tipo de producto actualizado exitosamente',
      data: tipo,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar tipo de producto parcialmente',
    description: 'Actualiza solo los campos proporcionados',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo actualizado',
  })
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTipoDto: UpdateTipoProductoDto,
  ) {
    const tipo = await this.tiposProductoService.update(id, updateTipoDto);
    return {
      success: true,
      message: 'Tipo de producto actualizado',
      data: tipo,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Desactivar tipo de producto (soft delete)',
    description:
      'Marca el tipo como inactivo sin eliminarlo de la base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo desactivado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Tipo no encontrado',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tiposProductoService.remove(id);
    return {
      success: true,
      message: 'Tipo de producto desactivado exitosamente',
    };
  }

  @Post(':id/activar')
  @ApiOperation({
    summary: 'Reactivar tipo de producto desactivado',
  })
  @ApiResponse({
    status: 200,
    description: 'Tipo reactivado',
  })
  async activar(@Param('id', ParseIntPipe) id: number) {
    const tipo = await this.tiposProductoService.activar(id);
    return {
      success: true,
      message: 'Tipo de producto activado exitosamente',
      data: tipo,
    };
  }
}
