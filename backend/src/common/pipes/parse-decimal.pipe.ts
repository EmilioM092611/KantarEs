// /src/common/pipes/parse-decimal.pipe.ts
import { BadRequestException, PipeTransform } from '@nestjs/common';
export class ParseDecimalPipe implements PipeTransform {
  transform(value: any) {
    const num = Number(value);
    if (Number.isNaN(num))
      throw new BadRequestException('Formato numérico inválido');
    return value; // deja string si usas Decimal de Prisma; cámbialo a num si lo necesitas
  }
}
