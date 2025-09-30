// ============== ordenes/ordenes.controller.ts ==============
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
  Request,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { CambiarEstadoItemDto } from './dto/cambiar-estado-item.dto';
import { AplicarDescuentoDto } from './dto/aplicar-descuento.dto';
import { AplicarPropinaDto } from './dto/aplicar-propina.dto';
import { DividirCuentaDto } from './dto/dividir-cuenta.dto';
import { QueryOrdenesDto } from './dto/query-ordenes.dto';
import { AddMultipleItemsDto } from './dto/add-multiple-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('ordenes')
@ApiBearerAuth('JWT-auth')
@Controller('ordenes')
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva orden' })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
  async create(@Body() createOrdenDto: CreateOrdenDto, @Request() req) {
    const orden = await this.ordenesService.create(
      createOrdenDto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Orden creada exitosamente',
      data: orden,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar órdenes con filtros' })
  async findAll(@Query() query: QueryOrdenesDto) {
    const result = await this.ordenesService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Obtener órdenes pendientes de pago' })
  async getPendientes() {
    const ordenes = await this.ordenesService.getOrdenesPendientes();
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get('cocina')
  @ApiOperation({ summary: 'Vista de órdenes para cocina' })
  async getCocina() {
    const ordenes = await this.ordenesService.getOrdenesCocina();
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get('por-servir')
  @ApiOperation({ summary: 'Obtener items listos para servir' })
  async getPorServir() {
    const items = await this.ordenesService.getItemsPorServir();
    return {
      success: true,
      data: items,
    };
  }

  @Get('sesion/:sesionId')
  @ApiOperation({ summary: 'Obtener órdenes de una sesión' })
  async findBySesion(@Param('sesionId', ParseIntPipe) sesionId: number) {
    const ordenes = await this.ordenesService.findBySesion(sesionId);
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get('mesa/:mesaId')
  @ApiOperation({ summary: 'Obtener órdenes activas de una mesa' })
  async findByMesa(@Param('mesaId', ParseIntPipe) mesaId: number) {
    const ordenes = await this.ordenesService.findByMesaActiva(mesaId);
    return {
      success: true,
      data: ordenes,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una orden' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const orden = await this.ordenesService.findOne(id);
    return {
      success: true,
      data: orden,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar orden' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrdenDto: UpdateOrdenDto,
  ) {
    const orden = await this.ordenesService.update(id, updateOrdenDto);
    return {
      success: true,
      message: 'Orden actualizada exitosamente',
      data: orden,
    };
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado de orden' })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoOrdenDto,
    @Request() req,
  ) {
    const orden = await this.ordenesService.cambiarEstado(
      id,
      dto,
      req.user.userId,
    );
    return {
      success: true,
      message: 'Estado actualizado exitosamente',
      data: orden,
    };
  }

  @Patch(':id/descuento')
  @ApiOperation({ summary: 'Aplicar descuento a orden' })
  async aplicarDescuento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AplicarDescuentoDto,
  ) {
    const orden = await this.ordenesService.aplicarDescuento(id, dto);
    return {
      success: true,
      message: 'Descuento aplicado exitosamente',
      data: orden,
    };
  }

  @Patch(':id/propina')
  @ApiOperation({ summary: 'Aplicar propina a orden' })
  async aplicarPropina(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AplicarPropinaDto,
  ) {
    const orden = await this.ordenesService.aplicarPropina(id, dto);
    return {
      success: true,
      message: 'Propina aplicada exitosamente',
      data: orden,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar orden' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const orden = await this.ordenesService.cambiarEstado(
      id,
      {
        id_estado_orden: 8, // Asumo que 8 es cancelada, ajustar según tu BD
        motivo: 'Cancelada por usuario',
      },
      req.user.userId,
    );
    return {
      success: true,
      message: 'Orden cancelada exitosamente',
      data: orden,
    };
  }

  // ========== ENDPOINTS DE ITEMS ==========

  @Post(':ordenId/items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar item a orden' })
  async addItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Body() addItemDto: AddItemDto,
  ) {
    const item = await this.ordenesService.addItem(ordenId, addItemDto);
    return {
      success: true,
      message: 'Item agregado exitosamente',
      data: item,
    };
  }

  @Post(':ordenId/items/multiple')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar múltiples items a orden' })
  async addMultipleItems(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Body() dto: AddMultipleItemsDto,
  ) {
    const items = await this.ordenesService.addMultipleItems(ordenId, dto);
    return {
      success: true,
      message: `${items.length} items agregados exitosamente`,
      data: items,
    };
  }

  @Get(':ordenId/items')
  @ApiOperation({ summary: 'Listar items de una orden' })
  async getItems(@Param('ordenId', ParseIntPipe) ordenId: number) {
    const orden = await this.ordenesService.findOne(ordenId);
    return {
      success: true,
      data: orden.orden_detalle,
    };
  }

  @Patch(':ordenId/items/:itemId')
  @ApiOperation({ summary: 'Actualizar item de orden' })
  async updateItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    const item = await this.ordenesService.updateItem(
      ordenId,
      itemId,
      updateItemDto,
    );
    return {
      success: true,
      message: 'Item actualizado exitosamente',
      data: item,
    };
  }

  @Patch(':ordenId/items/:itemId/estado')
  @ApiOperation({ summary: 'Cambiar estado de item' })
  async cambiarEstadoItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: CambiarEstadoItemDto,
  ) {
    const item = await this.ordenesService.cambiarEstadoItem(
      ordenId,
      itemId,
      dto,
    );
    return {
      success: true,
      message: 'Estado del item actualizado',
      data: item,
    };
  }

  @Delete(':ordenId/items/:itemId')
  @ApiOperation({ summary: 'Eliminar item de orden' })
  async removeItem(
    @Param('ordenId', ParseIntPipe) ordenId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    const result = await this.ordenesService.removeItem(ordenId, itemId);
    return {
      success: true,
      ...result,
    };
  }
}
