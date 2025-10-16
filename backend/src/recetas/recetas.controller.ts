// backend/src/productos/recetas/recetas.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Recetas (BOM)')
@ApiBearerAuth('JWT-auth')
@Controller('productos/:idProducto/receta')
@UseGuards(JwtAuthGuard)
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener receta completa de un producto (Bill of Materials)',
  })
  @ApiResponse({
    status: 200,
    description: 'Receta encontrada',
  })
  async getReceta(@Param('idProducto', ParseIntPipe) idProducto: number) {
    const receta = await this.recetasService.getReceta(idProducto);
    return {
      success: true,
      data: receta,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear o actualizar receta completa de un producto',
  })
  @ApiResponse({
    status: 201,
    description: 'Receta creada exitosamente',
  })
  async createReceta(
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Body() createRecetaDto: CreateRecetaDto,
  ) {
    const receta = await this.recetasService.createReceta(
      idProducto,
      createRecetaDto,
    );
    return {
      success: true,
      message: 'Receta creada exitosamente',
      data: receta,
    };
  }

  @Put(':idLinea')
  @ApiOperation({ summary: 'Actualizar una línea de receta específica' })
  async updateLineaReceta(
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Param('idLinea', ParseIntPipe) idLinea: number,
    @Body() updateRecetaDto: UpdateRecetaDto,
  ) {
    const linea = await this.recetasService.updateLineaReceta(
      idLinea,
      updateRecetaDto,
    );
    return {
      success: true,
      message: 'Línea de receta actualizada',
      data: linea,
    };
  }

  @Delete(':idLinea')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una línea de receta' })
  async deleteLineaReceta(
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @Param('idLinea', ParseIntPipe) idLinea: number,
  ) {
    await this.recetasService.deleteLineaReceta(idLinea);
  }

  @Get('costo-calculado')
  @ApiOperation({
    summary: 'Calcular costo total de producción basado en receta',
  })
  async calcularCostoProduccion(
    @Param('idProducto', ParseIntPipe) idProducto: number,
  ) {
    const costo = await this.recetasService.calcularCostoProduccion(idProducto);
    return {
      success: true,
      data: costo,
    };
  }

  @Get('validar')
  @ApiOperation({
    summary:
      'Validar coherencia de receta (detectar ciclos, unidades inválidas)',
  })
  async validarReceta(@Param('idProducto', ParseIntPipe) idProducto: number) {
    const validacion = await this.recetasService.validarReceta(idProducto);
    return {
      success: true,
      data: validacion,
    };
  }
}
