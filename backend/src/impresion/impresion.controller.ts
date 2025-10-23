/* eslint-disable @typescript-eslint/no-unsafe-argument */
// backend/src/impresion/impresion.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ImpresionService } from './impresion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfigurarImpresoraDto } from './dto/configurar-impresora.dto';
import { ImprimirComandaDto } from './dto/imprimir.dto';
import { ImprimirTicketDto } from './dto/imprimir.dto';
import { ImprimirCorteDto } from './dto/imprimir.dto';

@ApiTags('Sistema de Impresión')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('impresion')
export class ImpresionController {
  constructor(private readonly impresionService: ImpresionService) {}

  // ==================== GESTIÓN DE IMPRESORAS ====================

  @Post('impresoras')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Crear nueva impresora' })
  @ApiResponse({ status: 201, description: 'Impresora creada exitosamente' })
  async crearImpresora(@Body() dto: ConfigurarImpresoraDto) {
    const impresora = await this.impresionService.crearImpresora(dto);
    return {
      success: true,
      message: 'Impresora creada exitosamente',
      data: impresora,
    };
  }

  @Get('impresoras')
  @ApiOperation({ summary: 'Obtener todas las impresoras' })
  @ApiQuery({ name: 'estacion', required: false, example: 'cocina' })
  @ApiResponse({ status: 200, description: 'Impresoras obtenidas' })
  async obtenerImpresoras(@Query('estacion') estacion?: string) {
    const impresoras = await this.impresionService.obtenerImpresoras(estacion);
    return {
      success: true,
      data: impresoras,
      total: impresoras.length,
    };
  }

  @Get('impresoras/:id')
  @ApiOperation({ summary: 'Obtener impresora por ID' })
  @ApiParam({ name: 'id', description: 'ID de la impresora' })
  @ApiResponse({ status: 200, description: 'Impresora obtenida' })
  async obtenerImpresoraPorId(@Param('id', ParseIntPipe) id: number) {
    const impresora = await this.impresionService.obtenerImpresoraPorId(id);
    return {
      success: true,
      data: impresora,
    };
  }

  @Put('impresoras/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Actualizar configuración de impresora' })
  @ApiParam({ name: 'id', description: 'ID de la impresora' })
  @ApiResponse({ status: 200, description: 'Impresora actualizada' })
  async actualizarImpresora(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<ConfigurarImpresoraDto>,
  ) {
    const impresora = await this.impresionService.actualizarImpresora(id, dto);
    return {
      success: true,
      message: 'Impresora actualizada exitosamente',
      data: impresora,
    };
  }

  @Delete('impresoras/:id')
  @Roles('Administrador')
  @ApiOperation({ summary: 'Eliminar impresora' })
  @ApiParam({ name: 'id', description: 'ID de la impresora' })
  @ApiResponse({ status: 200, description: 'Impresora eliminada' })
  async eliminarImpresora(@Param('id', ParseIntPipe) id: number) {
    await this.impresionService.eliminarImpresora(id);
    return {
      success: true,
      message: 'Impresora eliminada exitosamente',
    };
  }

  @Post('impresoras/:id/verificar')
  @ApiOperation({
    summary: 'Verificar conexión con impresora',
    description: 'Hace ping a la impresora para verificar que esté en línea',
  })
  @ApiParam({ name: 'id', description: 'ID de la impresora' })
  @ApiResponse({
    status: 200,
    description: 'Estado de conexión verificado',
  })
  async verificarConexion(@Param('id', ParseIntPipe) id: number) {
    const resultado = await this.impresionService.verificarConexion(id);
    return {
      success: true,
      data: resultado,
    };
  }

  // ==================== IMPRESIÓN ====================

  @Post('comanda')
  @Roles('Administrador', 'Gerente', 'Mesero', 'Cajero')
  @ApiOperation({
    summary: 'Imprimir comanda de cocina',
    description:
      'Imprime la comanda de una orden en la impresora de cocina/barra',
  })
  @ApiResponse({
    status: 201,
    description: 'Comanda enviada a impresión',
  })
  async imprimirComanda(@Body() dto: ImprimirComandaDto, @Req() req: any) {
    const resultado = await this.impresionService.imprimirComanda(
      dto,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Comanda enviada a la cola de impresión',
      data: resultado,
    };
  }

  @Post('ticket')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Imprimir ticket de cliente',
    description: 'Imprime el ticket de pago para el cliente',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket enviado a impresión',
  })
  async imprimirTicket(@Body() dto: ImprimirTicketDto, @Req() req: any) {
    const resultado = await this.impresionService.imprimirTicket(
      dto,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Ticket enviado a la cola de impresión',
      data: resultado,
    };
  }

  @Post('corte')
  @Roles('Administrador', 'Gerente', 'Cajero')
  @ApiOperation({
    summary: 'Imprimir corte de caja',
    description: 'Imprime el reporte de corte de caja',
  })
  @ApiResponse({
    status: 201,
    description: 'Corte enviado a impresión',
  })
  async imprimirCorte(@Body() dto: ImprimirCorteDto, @Req() req: any) {
    const resultado = await this.impresionService.imprimirCorte(
      dto,
      req.user.id_usuario,
    );
    return {
      success: true,
      message: 'Corte enviado a la cola de impresión',
      data: resultado,
    };
  }

  // ==================== TRABAJOS ====================

  @Get('trabajos')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({ summary: 'Obtener historial de trabajos de impresión' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Trabajos obtenidos' })
  async obtenerTrabajos(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    const trabajos = await this.impresionService.obtenerTrabajos(limit, offset);
    return {
      success: true,
      data: trabajos,
      total: trabajos.length,
    };
  }

  @Get('trabajos/:id')
  @ApiOperation({ summary: 'Obtener trabajo de impresión por ID' })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({ status: 200, description: 'Trabajo obtenido' })
  async obtenerTrabajoPorId(@Param('id', ParseIntPipe) id: number) {
    const trabajo = await this.impresionService.obtenerTrabajoPorId(id);
    return {
      success: true,
      data: trabajo,
    };
  }

  @Post('trabajos/:id/reintentar')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Reintentar trabajo fallido',
    description: 'Vuelve a agregar un trabajo fallido a la cola de impresión',
  })
  @ApiParam({ name: 'id', description: 'ID del trabajo' })
  @ApiResponse({ status: 200, description: 'Trabajo reintentado' })
  async reintentarTrabajo(@Param('id', ParseIntPipe) id: number) {
    const resultado = await this.impresionService.reintentarTrabajo(id);
    return {
      success: true,
      ...resultado,
    };
  }

  // ==================== ESTADÍSTICAS ====================

  @Get('estadisticas')
  @Roles('Administrador', 'Gerente')
  @ApiOperation({
    summary: 'Obtener estadísticas de impresión',
    description:
      'Total de trabajos, pendientes, completados, errores, tasa de éxito',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  async obtenerEstadisticas() {
    const stats = await this.impresionService.obtenerEstadisticas();
    return {
      success: true,
      data: stats,
    };
  }
}
