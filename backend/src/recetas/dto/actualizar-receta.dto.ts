import { PartialType } from '@nestjs/swagger';
import { CrearRecetaDto } from './crear-receta.dto';

export class ActualizarRecetaDto extends PartialType(CrearRecetaDto) {}
