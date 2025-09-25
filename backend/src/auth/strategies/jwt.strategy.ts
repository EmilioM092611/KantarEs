/* eslint-disable @typescript-eslint/require-await */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
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

    return {
      userId: payload.sub,
      username: payload.username,
      rol: payload.rol,
    };
  }
}
