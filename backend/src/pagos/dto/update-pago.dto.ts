//update-pago.dto.ts
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePagoDto } from './create-pago.dto';

export class UpdatePagoDto extends PartialType(
  OmitType(CreatePagoDto, [
    'id_orden',
    'id_metodo_pago',
    'id_usuario_cobra',
    'monto',
  ] as const),
) {}
