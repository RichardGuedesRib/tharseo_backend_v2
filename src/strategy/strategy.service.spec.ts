import { Test, TestingModule } from '@nestjs/testing';
import { StrategyService } from './strategy.service';
import { PrismaService } from '../database/prisma.service';
import { UserService } from '../user/user.service';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyDto } from './dto/update-strategy.dto';
import { NotFoundException } from '@nestjs/common';

describe('StrategyService', () => {
  let service: StrategyService;
  let prisma: PrismaService;
  let userService: UserService;

  const tokenPayloadMock: TokenPayload = {
    userId: 'user-123',
    levelUser: 'admin',
    userName: 'alunodsm',
    isActive: true,
  };

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'User Test',
    password: 'hashed-password',
  };

  const createStrategyDTO: CreateStrategyDto = {
    name: 'Strategy 1',
    description: 'Description 1',
    userId: 'user-123',
    profit: '0',
    performance: '0',
    configStrategy: 'config',
    isActive: true,
  };

  const updateStrategyDTO: UpdateStrategyDto = {
    name: 'Strategy 1',
    userId: 'user-123',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategyService,
        {
          provide: PrismaService,
          useValue: {
            strategy: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StrategyService>(StrategyService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  it('strategy service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma nova strategy com sucesso', async () => {
      const mockStrategyCreated = {
        ...createStrategyDTO,
        userId: mockUser.id,
        id: 'strategy-id',
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (prisma.strategy.create as jest.Mock).mockResolvedValue(
        mockStrategyCreated,
      );

      const result = await service.create(createStrategyDTO, tokenPayloadMock);

      expect(userService.getUserById).toHaveBeenCalledWith(
        tokenPayloadMock.userId,
      );
      expect(prisma.strategy.create).toHaveBeenCalledWith({
        data: {
          ...createStrategyDTO,
          userId: mockUser.id,
        },
      });
      expect(result).toEqual(mockStrategyCreated);
      expect(result.userId).toBe(mockUser.id);
    });

    it('deve lançar um erro se o usuário não for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(createStrategyDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as strategies do usuario que requisitou', async () => {
      const mockResult = [
        { id: '1', userId: 'user-123' },
        { id: '2', userId: 'user-123' },
        { id: '3', userId: 'user-123' },
      ];

      (prisma.strategy.findMany as jest.Mock).mockResolvedValue(mockResult);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findAll(tokenPayloadMock);

      expect(result).toEqual(mockResult);
      expect(prisma.strategy.findMany).toHaveBeenCalledWith({
        where: {
          userId: tokenPayloadMock.userId,
        },
      });
      expect(userService.getUserById).toHaveBeenCalledWith(
        tokenPayloadMock.userId,
      );
      expect(result.length).toBe(3);
    });

    it('deve retornar NotFoundException se o usuário nao for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.findAll(tokenPayloadMock)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma strategy pelo id e pelo usuário', async () => {
      (prisma.strategy.findUnique as jest.Mock).mockResolvedValue(
        createStrategyDTO,
      );
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findOne('strategy-id', tokenPayloadMock);

      expect(result).toEqual(createStrategyDTO);
      expect(prisma.strategy.findUnique).toHaveBeenCalledWith({
        where: { id: 'strategy-id' },
      });
      expect(userService.getUserById).toHaveBeenCalledWith(
        tokenPayloadMock.userId,
      );
    });

    it('deve retornar NotFoundException se o usuario nao for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOne('strategy-id', tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar NotFoundException se a strategy nao for encontrada', async () => {
      (prisma.strategy.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOne('strategy-id', tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma strategy pelo id e pelo usuário', async () => {
      (prisma.strategy.findUnique as jest.Mock).mockResolvedValue(
        createStrategyDTO,
      );
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (prisma.strategy.update as jest.Mock).mockResolvedValue({
        ...createStrategyDTO,
        id: 'strategy-id',
      });

      const result = await service.update(
        'strategy-id',
        updateStrategyDTO,
        tokenPayloadMock,
      );

      expect(result).toEqual({
        ...createStrategyDTO,
        id: 'strategy-id',
      });
      expect(prisma.strategy.findUnique).toHaveBeenCalledWith({
        where: { id: 'strategy-id' },
      });
      expect(prisma.strategy.update).toHaveBeenCalledWith({
        where: { id: 'strategy-id' },
        data: updateStrategyDTO,
      });
    });

    it('deve retornar NotFoundException se o usuario nao for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('strategy-id', updateStrategyDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar NotFoundException se a strategy nao for encontrada', async () => {
      (prisma.strategy.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('strategy-id', updateStrategyDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
