// backend/src/estados-mesa/estados-mesa.controller.ts
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
import { EstadosMesaService } from './estados-mesa.service';
import { CreateEstadoMesaDto } from './dto/create-estado-mesa.dto';
import { UpdateEstadoMesaDto } from './dto/update-estado-mesa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Estados de Mesa')
@ApiBearerAuth('JWT-auth')
@Controller('estados-mesa')
@UseGuards(JwtAuthGuard)
export class EstadosMesaController {
  constructor(private readonly estadosMesaService: EstadosMesaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los estados de mesa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados obtenida exitosamente',
  })
  async findAll() {
    const estados = await this.estadosMesaService.findAll();
    return {
      success: true,
      data: estados,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener estado de mesa por ID' })
  @ApiResponse({
    status: 200,
    description: 'Estado encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Estado no encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const estado = await this.estadosMesaService.findOne(id);
    return {
      success: true,
      data: estado,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo estado de mesa' })
  @ApiResponse({
    status: 201,
    description: 'Estado creado exitosamente',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un estado con ese nombre',
  })
  async create(@Body() createEstadoMesaDto: CreateEstadoMesaDto) {
    const estado = await this.estadosMesaService.create(createEstadoMesaDto);
    return {
      success: true,
      message: 'Estado de mesa creado exitosamente',
      data: estado,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar estado de mesa' })
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
    @Body() updateEstadoMesaDto: UpdateEstadoMesaDto,
  ) {
    const estado = await this.estadosMesaService.update(
      id,
      updateEstadoMesaDto,
    );
    return {
      success: true,
      message: 'Estado de mesa actualizado exitosamente',
      data: estado,
    };
  }
}
