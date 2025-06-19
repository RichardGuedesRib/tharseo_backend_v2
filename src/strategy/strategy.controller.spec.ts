import { Test, TestingModule } from '@nestjs/testing';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { AuthGuard } from '../auth/auth.guard';
import { UpdateStrategyDto } from './dto/update-strategy.dto';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { find } from 'rxjs';
import { NotFoundException } from '@nestjs/common';

describe('StrategyController', () => {
  let controller: StrategyController;
  let service: StrategyService;

  const tokenPayloadMock: TokenPayload = {
    userId: 'user-123',
    levelUser: 'admin',
    userName: 'alunodsm',
    isActive: true,
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
    isActive: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StrategyController],
      providers: [
        {
          provide: StrategyService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<StrategyController>(StrategyController);
    service = module.get<StrategyService>(StrategyService);
  });

  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation((...args) => {
        if (args[0]) return;
      });
  });

  it('strategy controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma strategy', async () => {
      const strategyExpected = { id: 'strategy-id', ...createStrategyDTO };
      (service.create as jest.Mock).mockResolvedValue(strategyExpected);
      const result = await controller.create(
        createStrategyDTO,
        tokenPayloadMock,
      );
      expect(result).toEqual(strategyExpected);
    });

    it('deve retornar um erro se o usuario nao for encontrado', async () => {
      (service.create as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      const rejectTokenPayloadMock = { ...tokenPayloadMock, userId: '123' };
      await expect(
        controller.create(createStrategyDTO, rejectTokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as strategies', async () => {
      const strategysExpected = [
        { id: 'strategy-id', ...createStrategyDTO },
        { id: 'strategy-id2', ...createStrategyDTO },
        { id: 'strategy-id3', ...createStrategyDTO },
      ];
      (service.findAll as jest.Mock).mockResolvedValue(strategysExpected);
      const result = await controller.findAll(tokenPayloadMock);
      expect(result).toEqual(strategysExpected);
      expect(result.length).toBe(3);
    });

    it('deve retornar um erro se o usuario nao for encontrado', async () => {
      (service.findAll as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      const rejectTokenPayloadMock = { ...tokenPayloadMock, userId: '123' };
      await expect(controller.findAll(rejectTokenPayloadMock)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma strategy', async () => {
      const strategyExpected = { id: 'strategy-id', ...createStrategyDTO };
      (service.findOne as jest.Mock).mockResolvedValue(strategyExpected);
      const result = await controller.findOne('strategy-id', tokenPayloadMock);
      expect(result).toEqual(strategyExpected);
    });

    it('deve retornar um NotFoundException se a strategy nao for encontrada', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('Strategy not found'),
      );
      await expect(
        controller.findOne('strategy-id', tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar um erro se o usuario nao for encontrado', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      const rejectTokenPayloadMock = { ...tokenPayloadMock, userId: '123' };
      await expect(
        controller.findOne('strategy-id', rejectTokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma strategy', async () => {
      const strategyExpected = { id: 'strategy-id', ...updateStrategyDTO };
      (service.update as jest.Mock).mockResolvedValue(strategyExpected);
      const result = await controller.update(
        'strategy-id',
        updateStrategyDTO,
        tokenPayloadMock,
      );
      expect(result).toEqual(strategyExpected);
      expect(result.isActive).toBe(false);
      expect(result.isActive).not.toBe(createStrategyDTO.isActive);
    });

    it('deve retornar um NotFoundException se a strategy nao for encontrada', async () => {
      (service.update as jest.Mock).mockRejectedValue(
        new NotFoundException('Strategy not found'),
      );
      await expect(
        controller.update('strategy-id', updateStrategyDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar um erro se o usuario nao for encontrado', async () => {
      (service.update as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      const rejectTokenPayloadMock = { ...tokenPayloadMock, userId: '123' };
      await expect(
        controller.update(
          'strategy-id',
          updateStrategyDTO,
          rejectTokenPayloadMock,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
