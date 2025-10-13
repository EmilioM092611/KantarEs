import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsuariosService (Unit Tests)', () => {
  let service: UsuariosService;
  let prisma: PrismaService;

  const mockPrismaService = {
    usuarios: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    personas: {
      create: jest.fn(),
    },
    roles: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user with persona in transaction', async () => {
      const createDto = {
        username: 'newuser',
        password: 'Password123!',
        email: 'new@example.com',
        nombre: 'Juan',
        apellido_paterno: 'Pérez',
        id_rol: 2,
      };

      const mockPersona = {
        id_persona: 1,
        nombre: 'Juan',
        apellido_paterno: 'Pérez',
      };

      const mockUsuario = {
        id_usuario: 1,
        username: 'newuser',
        email: 'new@example.com',
        id_persona: 1,
        id_rol: 2,
        activo: true,
      };

      mockPrismaService.personas.create.mockResolvedValue(mockPersona);
      mockPrismaService.usuarios.create.mockResolvedValue(mockUsuario);
      mockPrismaService.roles.findUnique.mockResolvedValue({
        id_rol: 2,
        nombre: 'Cajero',
      });

      const result = await service.create(createDto);

      expect(result).toEqual(mockUsuario);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.personas.create).toHaveBeenCalled();
      expect(mockPrismaService.usuarios.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate username', async () => {
      mockPrismaService.usuarios.findUnique.mockResolvedValue({
        username: 'existinguser',
      });

      await expect(
        service.create({
          username: 'existinguser',
          password: 'Pass123!',
          nombre: 'Test',
          apellido_paterno: 'User',
          id_rol: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException on duplicate email', async () => {
      mockPrismaService.usuarios.findFirst.mockResolvedValue({
        email: 'existing@example.com',
      });

      await expect(
        service.create({
          username: 'newuser',
          password: 'Pass123!',
          email: 'existing@example.com',
          nombre: 'Test',
          apellido_paterno: 'User',
          id_rol: 2,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should validate rol exists', async () => {
      mockPrismaService.roles.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          username: 'user',
          password: 'Pass123!',
          nombre: 'Test',
          apellido_paterno: 'User',
          id_rol: 999, // Rol no existe
        }),
      ).rejects.toThrow('Rol no encontrado');
    });
  });

  describe('findAll', () => {
    it('should return paginated users with filters', async () => {
      const mockUsers = [
        { id_usuario: 1, username: 'user1', activo: true },
        { id_usuario: 2, username: 'user2', activo: true },
      ];

      mockPrismaService.usuarios.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.usuarios.count.mockResolvedValue(2);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        activo: true,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by rol', async () => {
      mockPrismaService.usuarios.findMany.mockResolvedValue([]);
      mockPrismaService.usuarios.count.mockResolvedValue(0);

      await service.findAll({ id_rol: 2 });

      expect(mockPrismaService.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id_rol: 2 }),
        }),
      );
    });

    it('should exclude deleted users by default', async () => {
      mockPrismaService.usuarios.findMany.mockResolvedValue([]);
      mockPrismaService.usuarios.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrismaService.usuarios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deleted_at: null }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id_usuario: 1,
        username: 'user1',
        email: 'user1@test.com',
      };

      const updatedUser = {
        ...existingUser,
        email: 'newemail@test.com',
      };

      mockPrismaService.usuarios.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.usuarios.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, { email: 'newemail@test.com' });

      expect(result.email).toBe('newemail@test.com');
    });

    it('should not allow updating to existing email', async () => {
      const existingUser = { id_usuario: 1, email: 'user1@test.com' };
      const otherUser = { id_usuario: 2, email: 'existing@test.com' };

      mockPrismaService.usuarios.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.usuarios.findFirst.mockResolvedValue(otherUser);

      await expect(
        service.update(1, { email: 'existing@test.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user (soft delete)', async () => {
      const user = {
        id_usuario: 1,
        activo: true,
        deleted_at: null,
      };

      mockPrismaService.usuarios.findUnique.mockResolvedValue(user);
      mockPrismaService.usuarios.update.mockResolvedValue({
        ...user,
        activo: false,
        deleted_at: new Date(),
      });

      const result = await service.deactivate(1);

      expect(result.activo).toBe(false);
      expect(result.deleted_at).not.toBeNull();
    });
  });

  describe('Security Features', () => {
    it('should increment failed login attempts', async () => {
      const user = {
        id_usuario: 1,
        intentos_fallidos: 2,
      };

      mockPrismaService.usuarios.findUnique.mockResolvedValue(user);
      mockPrismaService.usuarios.update.mockResolvedValue({
        ...user,
        intentos_fallidos: 3,
      });

      await service.incrementFailedAttempts(1);

      expect(mockPrismaService.usuarios.update).toHaveBeenCalledWith({
        where: { id_usuario: 1 },
        data: { intentos_fallidos: 3 },
      });
    });

    it('should block user after 5 failed attempts', async () => {
      const user = {
        id_usuario: 1,
        intentos_fallidos: 4, // 5to intento
      };

      mockPrismaService.usuarios.findUnique.mockResolvedValue(user);

      await service.incrementFailedAttempts(1);

      expect(mockPrismaService.usuarios.update).toHaveBeenCalledWith({
        where: { id_usuario: 1 },
        data: expect.objectContaining({
          intentos_fallidos: 5,
          bloqueado_hasta: expect.any(Date),
        }),
      });
    });

    it('should reset failed attempts on successful login', async () => {
      mockPrismaService.usuarios.update.mockResolvedValue({});

      await service.resetFailedAttempts(1);

      expect(mockPrismaService.usuarios.update).toHaveBeenCalledWith({
        where: { id_usuario: 1 },
        data: {
          intentos_fallidos: 0,
          bloqueado_hasta: null,
        },
      });
    });
  });
});
