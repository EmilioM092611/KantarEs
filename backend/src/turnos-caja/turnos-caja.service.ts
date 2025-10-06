import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TurnosCajaService {
  constructor(private readonly prisma: PrismaService) {}

  private folio(prefix = 'COR'): string {
    const now = new Date();
    const ts = now.toISOString().replace(/[-:.TZ]/g, '');
    const rnd = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${ts}-${rnd}`;
  }

  abrir(dto: {
    id_usuario_realiza: number;
    id_tipo_corte: number;
    fondo_caja_inicial?: string;
    observaciones?: string;
  }) {
    const inicio = new Date();
    return this.prisma.cortes_caja.create({
      data: {
        folio_corte: this.folio(),
        id_tipo_corte: Number(dto.id_tipo_corte),
        id_usuario_realiza: Number(dto.id_usuario_realiza),
        fecha_hora_inicio: inicio,
        fecha_hora_fin: inicio, // se actualizará al cerrar
        fondo_caja_inicial: (dto.fondo_caja_inicial ?? '0') as any,
        observaciones: dto.observaciones ?? null,
        estado: 'abierto',
      } as any,
    });
  }

  async cerrar(
    id_corte: number,
    dto: {
      efectivo_contado?: string;
      fondo_caja_final?: string;
      observaciones?: string;
    },
  ) {
    const corte = await this.prisma.cortes_caja.findUnique({
      where: { id_corte },
    });
    if (!corte || (corte as any).estado !== 'abierto') {
      throw new BadRequestException('Corte inexistente o ya cerrado');
    }
    return this.prisma.cortes_caja.update({
      where: { id_corte },
      data: {
        fecha_hora_fin: new Date(),
        efectivo_contado: (dto.efectivo_contado ?? '0') as any,
        fondo_caja_final: (dto.fondo_caja_final ?? '0') as any,
        observaciones: dto.observaciones ?? corte.observaciones ?? null,
        estado: 'cerrado',
      } as any,
    });
  }

  activos() {
    return this.prisma.cortes_caja.findMany({
      where: { estado: 'abierto' } as any,
    });
  }
}
