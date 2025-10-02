import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret =
      configService.get<string>('JWT_SECRET') ||
      '435ab20661e825b88481f6afebd5095ee5b6a971c82c7aec5572e325faf737c0';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    console.log(
      'JwtStrategy - Inicializado con secret:',
      secret.substring(0, 10) + '...',
    );
  }

  async validate(payload: any) {
    console.log('JwtStrategy - Validando payload:', payload);

    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Token inválido');
    }

    // Consultar el usuario completo en la BD para obtener datos actualizados
    const usuario = await this.prisma.usuarios.findUnique({
      where: { id_usuario: payload.sub },
      include: {
        personas: {
          select: {
            nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
          },
        },
        roles: {
          select: {
            id_rol: true,
            nombre: true,
            nivel_acceso: true,
          },
        },
      },
    });

    // Validar que el usuario existe y está activo
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Devolver el objeto user que estará disponible en req.user
    return {
      id_usuario: usuario.id_usuario,
      username: usuario.username,
      email: usuario.email,
      rol: usuario.roles, // Objeto completo del rol con { id_rol, nombre, nivel_acceso }
      persona: usuario.personas,
    };
  }
}
