import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-001',
    email: 'user@example.com',
    name: 'User Test',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('deve criar um novo usuário e retornar os dados sem a senha', async () => {
      const inputData = {
        email: 'user@example.com',
        name: 'User Test',
        lastName: 'Test',
        phone: '11912345678',
        levelUser: 'admin',
        balance: 100,
        isActive: true,
        password: 'hashed-password',
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.createUser(inputData);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: inputData });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('getUserByEmail', () => {
    it('deve retornar um usuário se encontrado por email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('user@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('deve retornar uma lista de usuários', async () => {
      const users = [mockUser, { ...mockUser, id: 'user-002', email: 'another@example.com' }];
      (prisma.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  // GET BY ID
  describe('getUserById', () => {
    it('deve retornar um usuário com wallets e credential se encontrado por ID', async () => {
      const userWithRelations = {
        ...mockUser,
        wallets: [{ id: 'wallet-001', balance: 100 }],
        credential: { id: 'cred-001', level: 'admin' },
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithRelations);

      const result = await service.getUserById('user-001');

      expect(result).toEqual(userWithRelations);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-001' },
        include: { wallets: true, credential: true },
      });
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getUserById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});
