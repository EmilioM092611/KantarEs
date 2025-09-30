// ============== update-orden.dto.ts ==============
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrdenDto } from './create-orden.dto';

export class UpdateOrdenDto extends PartialType(
  OmitType(CreateOrdenDto, ['id_sesion_mesa', 'items'] as const),
) {}
