// backend/src/estados-orden/estados-orden.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EstadosOrdenService } from './estados-orden.service';
import { CreateEstadoOrdenDto } from './dto/create-estado-orden.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Estados de Orden')
@ApiBearerAuth('JWT-auth')
@Controller('estados-orden')
@UseGuards(JwtAuthGuard)
export class EstadosOrdenController {
  constructor(private readonly estadosOrdenService: EstadosOrdenService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de orden' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados obtenida exitosamente',
  })
  async findAll() {
    const estados = await this.estadosOrdenService.findAll();
    return {
      success: true,
      data: estados,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado de orden por ID' })
  @ApiResponse({
    status: 200,
    description: 'Estado encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const estado = await this.estadosOrdenService.findOne(id);
    return {
      success: true,
      data: estado,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo estado de orden' })
  @ApiResponse({
    status: 201,
    description: 'Estado creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un estado con ese nombre',
  })
  async create(@Body() createEstadoOrdenDto: CreateEstadoOrdenDto) {
    const estado = await this.estadosOrdenService.create(createEstadoOrdenDto);
    return {
      success: true,
      message: 'Estado de orden creado exitosamente',
      data: estado,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estado de orden' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado no encontrado',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoOrdenDto: UpdateEstadoOrdenDto,
  ) {
    const estado = await this.estadosOrdenService.update(
      id,
      updateEstadoOrdenDto,
    );
    return {
      success: true,
      message: 'Estado de orden actualizado exitosamente',
      data: estado,
    };
  }
}
