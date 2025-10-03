// update-tipo-corte.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTipoCorteDto } from './create-tipo-corte.dto';

export class UpdateTipoCorteDto extends PartialType(CreateTipoCorteDto) {}
