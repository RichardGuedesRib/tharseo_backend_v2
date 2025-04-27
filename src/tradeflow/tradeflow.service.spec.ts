import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTradeflowDto } from './dto/create-tradeflow.dto';
import { UpdateTradeflowDto } from './dto/update-tradeflow.dto';
import { TokenPayload } from '../auth/dtos/token.payload';
import { TradeflowService } from './tradeflow.service';
import { PrismaService } from '../database/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { StrategyService } from '../strategy/strategy.service';
import { AssetService } from '../asset/asset.service';
import { EngineTharseoService } from '../engine-tharseo/engine-tharseo.service';

describe('TradeflowService', () => {
  let service: TradeflowService;
  let prisma: PrismaService;
  let strategyService: StrategyService;
  let assetService: AssetService;

  const mockUser: TokenPayload = {
    userId: 'user-123',
    levelUser: 'admin',
    userName: 'alunodsm',
    isActive: true,
  };

  const createDto: CreateTradeflowDto = {
    assetId: 'asset-001',
    strategyId: 'strategy-001',
  } as any;

  const updateDto: UpdateTradeflowDto = {
    assetId: 'asset-002',
    strategyId: 'strategy-002',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeflowService,
        {
          provide: PrismaService,
          useValue: {
            tradeflow: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: StrategyService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: AssetService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EngineTharseoService,
          useValue: {
            startEngineTharseo: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TradeflowService>(TradeflowService);
    prisma = module.get<PrismaService>(PrismaService);
    strategyService = module.get<StrategyService>(StrategyService);
    assetService = module.get<AssetService>(AssetService);
  });

  describe('create', () => {
    it('deve criar um novo tradeflow com sucesso', async () => {
      (strategyService.findOne as jest.Mock).mockResolvedValue({ id: 'strategy-001' });
      (assetService.findOne as jest.Mock).mockResolvedValue({ id: 'asset-001' });
      (prisma.tradeflow.create as jest.Mock).mockResolvedValue({ id: 'tradeflow-001', ...createDto });

      const result = await service.create(createDto, mockUser);

      expect(result).toEqual({ id: 'tradeflow-001', ...createDto });
      expect(strategyService.findOne).toHaveBeenCalledWith('strategy-001', mockUser);
      expect(assetService.findOne).toHaveBeenCalledWith('asset-001');
    });

    it('deve lançar NotFoundException se a estratégia não for encontrada', async () => {
      (strategyService.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.create(createDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o ativo não for encontrado', async () => {
      (strategyService.findOne as jest.Mock).mockResolvedValue({});
      (assetService.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.create(createDto, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os tradeflows do usuário', async () => {
      const mockResult = [{ id: '1' }, { id: '2' }];
      (prisma.tradeflow.findMany as jest.Mock).mockResolvedValue(mockResult);

      const result = await service.findAll(mockUser);

      expect(result).toEqual(mockResult);
      expect(prisma.tradeflow.findMany).toHaveBeenCalledWith({
        where: {
          strategy: { userId: mockUser.userId },
        },
        include: { strategy: true, asset: true },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar o tradeflow se encontrado', async () => {
      const mockTradeflow = { id: '1', strategy: { userId: mockUser.userId } };
      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(mockTradeflow);

      const result = await service.findOne('1', mockUser);

      expect(result).toEqual(mockTradeflow);
    });

    it('deve lançar NotFoundException se o tradeflow não for encontrado', async () => {
      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('not-found', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o tradeflow se existir e pertencer ao usuário', async () => {
      const tradeflow = {
        id: '1',
        isActive: true,
        strategy: { userId: mockUser.userId },
      };

      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(tradeflow);
      (prisma.tradeflow.update as jest.Mock).mockResolvedValue({ id: '1', ...updateDto });

      const result = await service.update('1', updateDto, mockUser);

      expect(result).toEqual({ id: '1', ...updateDto });
    });

    it('deve lançar NotFoundException se o tradeflow não existir', async () => {
      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.update('not-found', updateDto, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException se o tradeflow não pertencer ao usuário', async () => {
      const tradeflow = {
        id: '1',
        strategy: { userId: 'outro-user' },
      };

      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(tradeflow);

      await expect(service.update('1', updateDto, mockUser)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('remove', () => {
    it('deve remover o tradeflow se existir e pertencer ao usuário', async () => {
      const tradeflow = {
        id: '1',
        strategy: { userId: mockUser.userId },
      };

      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(tradeflow);
      (prisma.tradeflow.delete as jest.Mock).mockResolvedValue(tradeflow);

      const result = await service.remove('1', mockUser);

      expect(result).toEqual(tradeflow);
    });

    it('deve lançar NotFoundException se o tradeflow não existir', async () => {
      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('not-found', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnauthorizedException se o tradeflow não pertencer ao usuário', async () => {
      const tradeflow = {
        id: '1',
        strategy: { userId: 'outro-user' },
      };

      (prisma.tradeflow.findUnique as jest.Mock).mockResolvedValue(tradeflow);

      await expect(service.remove('1', mockUser)).rejects.toThrow(UnauthorizedException);
    });
  });
});
