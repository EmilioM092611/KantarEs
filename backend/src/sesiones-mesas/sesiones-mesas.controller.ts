/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { SesionesMesaService } from './sesiones-mesas.service';
import { AbrirSesionDto } from './dto/abrir-sesion.dto';
import { CerrarSesionDto } from './dto/cerrar-sesion.dto';
import { ActualizarSesionDto } from './dto/actualizar-sesion.dto';
import { TransferirMesaDto } from './dto/transferir-mesa.dto';
import { QuerySesionesDto } from './dto/query-sesiones.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sesiones-mesa')
@ApiBearerAuth('JWT-auth')
@Controller('sesiones-mesa')
@UseGuards(JwtAuthGuard)
export class SesionesMesaController {
  constructor(private readonly sesionesMesaService: SesionesMesaService) {}

  @Post('abrir')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Abrir nueva sesión de mesa' })
  async abrirSesion(@Body() abrirSesionDto: AbrirSesionDto, @Request() req) {
    const sesion = await this.sesionesMesaService.abrirSesion(
      abrirSesionDto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión abierta exitosamente',
      data: sesion,
    };
  }

  @Patch(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar sesión de mesa' })
  async cerrarSesion(
    @Param('id', ParseIntPipe) id: number,
    @Body() cerrarSesionDto: CerrarSesionDto,
    @Request() req,
  ) {
    const sesion = await this.sesionesMesaService.cerrarSesion(
      id,
      req.user.userId,
      cerrarSesionDto,
    );
    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
      data: sesion,
    };
  }

  @Get('activas')
  @ApiOperation({ summary: 'Listar sesiones activas' })
  async getActivas() {
    const sesiones = await this.sesionesMesaService.getActivas();
    return {
      success: true,
      data: sesiones,
    };
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar sesiones con filtros' })
  async buscar(@Query() query: QuerySesionesDto) {
    const sesiones = await this.sesionesMesaService.buscar(query);
    return {
      success: true,
      data: sesiones,
    };
  }

  @Get('mesa/:mesaId')
  @ApiOperation({ summary: 'Obtener sesión actual de una mesa' })
  async getSesionByMesa(@Param('mesaId', ParseIntPipe) mesaId: number) {
    const sesion = await this.sesionesMesaService.getSesionByMesa(mesaId);
    return {
      success: true,
      data: sesion,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de sesión' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const sesion = await this.sesionesMesaService.findOne(id);
    return {
      success: true,
      data: sesion,
    };
  }

  @Get(':id/resumen')
  @ApiOperation({ summary: 'Obtener resumen completo de sesión' })
  async getResumen(@Param('id', ParseIntPipe) id: number) {
    const resumen = await this.sesionesMesaService.getResumen(id);
    return {
      success: true,
      data: resumen,
    };
  }

  @Patch(':id/comensales')
  @ApiOperation({ summary: 'Actualizar número de comensales' })
  async actualizarComensales(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarSesionDto,
  ) {
    // Validar que se proporcione numero_comensales
    if (!dto.numero_comensales) {
      throw new BadRequestException(
        'Debe proporcionar el número de comensales',
      );
    }

    const sesion = await this.sesionesMesaService.actualizarComensales(
      id,
      dto.numero_comensales, // Ahora TypeScript sabe que no es undefined
    );
    return {
      success: true,
      message: 'Comensales actualizados',
      data: sesion,
    };
  }

  @Patch(':id/transferir')
  @ApiOperation({ summary: 'Transferir sesión a otra mesa' })
  async transferirMesa(
    @Param('id', ParseIntPipe) id: number,
    @Body() transferirDto: TransferirMesaDto,
    @Request() req,
  ) {
    const sesion = await this.sesionesMesaService.transferirMesa(
      id,
      transferirDto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión transferida exitosamente',
      data: sesion,
    };
  }

  @Patch(':id/pausar')
  @ApiOperation({ summary: 'Pausar sesión' })
  async pausarSesion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const sesion = await this.sesionesMesaService.pausarSesion(
      id,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión pausada',
      data: sesion,
    };
  }

  @Post(':id/reanudar')
  @ApiOperation({ summary: 'Reanudar sesión pausada' })
  async reanudarSesion(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const sesion = await this.sesionesMesaService.reanudarSesion(
      id,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Sesión reanudada',
      data: sesion,
    };
  }
}
