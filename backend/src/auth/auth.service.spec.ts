/* eslint-disable @typescript-eslint/unbound-method */
// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService (Unit Tests)', () => {
  let service: AuthService;

  const mockPrisma = {
    usuarios: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const mockJwt = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  } as unknown as JwtService;

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const makeUser = (overrides: Partial<any> = {}) => ({
    id_usuario: 77,
    username: 'jdoe',
    password_hash: hash('ValidPass!123'),
    activo: true,
    intentos_fallidos: 0,
    bloqueado_hasta: null as Date | null,
    roles: { nombre: 'admin' },
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token with valid credentials e incluir rol en el payload', async () => {
      const user = makeUser();
      (mockPrisma.usuarios.findUnique as any).mockResolvedValue(user);
      (mockJwt.signAsync as any).mockImplementation(async (payload: any) => {
        // aseguramos que venga el rol en el payload
        expect(payload).toEqual(
          expect.objectContaining({ rol: 'admin', sub: user.id_usuario }),
        );
        return 'token.mock';
      });

      const res = await service.login('jdoe', 'ValidPass!123');

      expect(res.access_token).toBe('token.mock');
      expect(res.user.username).toBe('jdoe');
      expect(res.user.roles?.nombre).toBe('admin');

      // debe resetear contadores en éxito
      expect(mockPrisma.usuarios.update).toHaveBeenCalledWith({
        where: { id_usuario: user.id_usuario },
        data: expect.objectContaining({
          intentos_fallidos: 0,
          bloqueado_hasta: null,
        }),
      });
    });

    it('debe fallar con usuario inexistente', async () => {
      (mockPrisma.usuarios.findUnique as any).mockResolvedValue(null);
      await expect(service.login('unknown', 'whatever')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('debe fallar con password incorrecto', async () => {
      const user = makeUser();
      (mockPrisma.usuarios.findUnique as any).mockResolvedValue(user);
      (mockPrisma.usuarios.update as any).mockResolvedValue({
        ...user,
        intentos_fallidos: 1,
      });

      await expect(service.login('jdoe', 'WrongPass')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(mockPrisma.usuarios.update).toHaveBeenCalledWith({
        where: { id_usuario: user.id_usuario },
        data: expect.objectContaining({ intentos_fallidos: 1 }),
      });
    });

    it('debe fallar si el usuario está inactivo', async () => {
      const user = makeUser({ activo: false });
      (mockPrisma.usuarios.findUnique as any).mockResolvedValue(user);

      await expect(
        service.login('jdoe', 'ValidPass!123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('debe fallar si el usuario está bloqueado', async () => {
      const future = new Date(Date.now() + 10 * 60 * 1000);
      const user = makeUser({ bloqueado_hasta: future });
      (mockPrisma.usuarios.findUnique as any).mockResolvedValue(user);

      await expect(
        service.login('jdoe', 'ValidPass!123'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('debe bloquear al usuario tras 5 intentos fallidos', async () => {
      // simulamos estado persistente de intentos y bloqueo
      let intentos = 0;
      let bloqueado_hasta: Date | null = null;

      (mockPrisma.usuarios.findUnique as any).mockImplementation(async () =>
        makeUser({ intentos_fallidos: intentos, bloqueado_hasta }),
      );

      (mockPrisma.usuarios.update as any).mockImplementation(
        async ({ data }: any) => {
          if (typeof data.intentos_fallidos === 'number') {
            intentos = data.intentos_fallidos;
          }
          if ('bloqueado_hasta' in data) {
            bloqueado_hasta = data.bloqueado_hasta ?? null;
          }
          return makeUser({ intentos_fallidos: intentos, bloqueado_hasta });
        },
      );

      // 5 intentos con contraseña incorrecta
      for (let i = 0; i < 5; i++) {
        await expect(service.login('jdoe', 'wrong')).rejects.toBeInstanceOf(
          UnauthorizedException,
        );
      }

      expect(mockPrisma.usuarios.update).toHaveBeenCalled();
      expect(intentos).toBe(5);
      expect(bloqueado_hasta).toBeInstanceOf(Date);
      expect(bloqueado_hasta!.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
