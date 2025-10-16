// backend/src/generos/generos.controller.ts
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
} from '@nestjs/common';
import { GenerosService } from './generos.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { QueryGenerosDto } from './dto/query-generos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Géneros')
@ApiBearerAuth('JWT-auth')
@Controller('generos')
@UseGuards(JwtAuthGuard)
export class GenerosController {
  constructor(private readonly generosService: GenerosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los géneros' })
  @ApiResponse({ status: 200, description: 'Lista de géneros' })
  async findAll(@Query() query: QueryGenerosDto) {
    const generos = await this.generosService.findAll(query);
    return {
      success: true,
      data: generos,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un género por ID' })
  @ApiResponse({ status: 200, description: 'Género encontrado' })
  @ApiResponse({ status: 404, description: 'Género no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const genero = await this.generosService.findOne(id);
    return {
      success: true,
      data: genero,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo género' })
  @ApiResponse({ status: 201, description: 'Género creado exitosamente' })
  async create(@Body() createGeneroDto: CreateGeneroDto) {
    const genero = await this.generosService.create(createGeneroDto);
    return {
      success: true,
      message: 'Género creado exitosamente',
      data: genero,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar género' })
  @ApiResponse({ status: 200, description: 'Género actualizado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGeneroDto: UpdateGeneroDto,
  ) {
    const genero = await this.generosService.update(id, updateGeneroDto);
    return {
      success: true,
      message: 'Género actualizado exitosamente',
      data: genero,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar género (soft delete)' })
  @ApiResponse({ status: 204, description: 'Género desactivado' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.generosService.remove(id);
  }
}
