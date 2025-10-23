import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesGateway } from '../notificaciones/notificaciones.gateway';
import {
  TipoNotificacion,
  CanalNotificacion,
} from '../notificaciones/interfaces/notification.interface';

@Injectable()
export class MesasCronService {
  private readonly logger = new Logger(MesasCronService.name);

  constructor(
    private prisma: PrismaService,
    private notificacionesGateway: NotificacionesGateway,
  ) {}

  @Cron('*/5 * * * *') // Cada 5 minutos
  async verificarMesasSinAtencion() {
    const tiempoLimite = new Date();
    tiempoLimite.setMinutes(tiempoLimite.getMinutes() - 15);

    const mesasSinAtencion = await this.prisma.sesiones_mesa.findMany({
      where: {
        estado: 'abierta',
        fecha_hora_apertura: {
          lt: tiempoLimite,
        },
      },
      include: {
        mesas: true,
      },
    });

    for (const sesion of mesasSinAtencion) {
      this.notificacionesGateway.emitirNotificacion({
        tipo: TipoNotificacion.MESA_SIN_ATENCION,
        titulo: 'Mesa sin atención',
        mensaje: `Mesa ${sesion.mesas.numero_mesa} lleva más de 15 minutos sin atención`,
        canal: CanalNotificacion.MESEROS,
        prioridad: 'alta',
        id_mesa: sesion.id_mesa,
      });
    }

    if (mesasSinAtencion.length > 0) {
      this.logger.warn(
        `${mesasSinAtencion.length} mesas sin atención detectadas`,
      );
    }
  }
}
