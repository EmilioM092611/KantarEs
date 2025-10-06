import { IsInt, IsOptional, IsString, Min } from 'class-validator';
export class PaginationDto {
  @IsOptional() @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @IsInt() @Min(1) limit?: number = 20;
  @IsOptional() @IsString() order?: string;
}
export function toPrismaPagination(q: PaginationDto) {
  const take = Math.min(q.limit ?? 20, 100);
  const page = q.page ?? 1;
  const skip = (page - 1) * take;
  let orderBy: any = undefined;
  if (q.order) {
    const [field, dir] = q.order.split(':');
    orderBy = {
      [field]: (dir ?? 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc',
    };
  }
  return { skip, take, orderBy };
}
