import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  register(registerDto: any) {
    throw new Error('Method not implemented.');
  }
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.usuarios.findFirst({
      where: { username, activo: true },
      include: {
        roles: true,
        personas: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id_usuario,
      username: user.username,
      rol: user.roles.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id_usuario,
        username: user.username,
        email: user.email,
        nombre: `${user.personas.nombre} ${user.personas.apellido_paterno}`,
        rol: user.roles.nombre,
      },
    };
  }
}
