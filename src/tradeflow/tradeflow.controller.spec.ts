import { Test, TestingModule } from '@nestjs/testing';
import { TradeflowController } from './tradeflow.controller';
import { TradeflowService } from './tradeflow.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateTradeflowDto } from './dto/create-tradeflow.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateTradeflowDto } from './dto/update-tradeflow.dto';

describe('TradeflowController', () => {
  let controller: TradeflowController;
  let service: TradeflowService;

  const mockTradeflowService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { userId: 'user123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeflowController],
      providers: [
        {
          provide: TradeflowService,
          useValue: mockTradeflowService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<TradeflowController>(TradeflowController);
    service = module.get<TradeflowService>(TradeflowService);
  });

  it('tradeflow controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo TradeFlow com sucesso', async () => {
      const createTradeflowDto = {
        strategyId: 'strategy-001',
        assetId: 'asset-001',
        isActive: true,
      } as CreateTradeflowDto;

      const tradeflowExpected = { id: 'tradeflow-001', ...createTradeflowDto };
      mockTradeflowService.create.mockResolvedValue(tradeflowExpected);

      const result = await controller.create(createTradeflowDto, {
        user: mockUser,
      });

      expect(service.create).toHaveBeenCalledWith(createTradeflowDto, mockUser);
      expect(result).toEqual(tradeflowExpected);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de tradeflows', async () => {
      const tradeflows = [{ id: 'tradeflow-001' }, { id: 'tradeflow-002' }];
      mockTradeflowService.findAll.mockResolvedValue(tradeflows);

      const result = await controller.findAll({ user: mockUser });

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(tradeflows);
    });
  });

  describe('findOne', () => {
    it('deve retornar um tradeflow', async () => {
      const tradeflow = {
        id: 'tradeflow-001',
        strategyId: 'strategy-001',
        assetId: 'asset-001',
      };
      mockTradeflowService.findOne.mockResolvedValue(tradeflow);

      const result = await controller.findOne('tradeflow-001', {
        user: mockUser,
      });

      expect(service.findOne).toHaveBeenCalledWith('tradeflow-001', mockUser);
      expect(result).toEqual(tradeflow);
    });

    it('deve retornar uma exception se o tradeflow nao for encontrado', async () => {
      mockTradeflowService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne('tradeflow-001', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar um tradeflow', async () => {
      const tradeflowDTO: UpdateTradeflowDto = { isActive: true };
      const tradeflowUpdated = { id: 'tradeflow-001', idActive: false };

      mockTradeflowService.update.mockResolvedValue(tradeflowUpdated);

      const result = await controller.update('tradeflow-001', tradeflowDTO, {
        user: mockUser,
      });

      expect(service.update).toHaveBeenCalledWith(
        'tradeflow-001',
        tradeflowDTO,
        mockUser,
      );
      expect(result).toEqual(tradeflowUpdated);
    });
  });

  it('deve retornar uma exception se o tradeflow nao for encontrado', async () => {
    mockTradeflowService.update.mockImplementation(() => {
      throw new NotFoundException('TradeFlow not found');
    });

    const tradeflowDTO: UpdateTradeflowDto = { isActive: true };

    await expect(
      controller.update('tradeflow-001', tradeflowDTO, { user: mockUser }),
    ).rejects.toThrow(NotFoundException);

    expect(service.update).toHaveBeenCalledWith(
      'tradeflow-001',
      tradeflowDTO,
      mockUser,
    );
  });

  describe('remove', () => {
    it('deve remover um tradeflow com sucesso', async () => {
      const deletedTradeflow = { id: 'tradeflow-001' };

      mockTradeflowService.remove.mockResolvedValue(deletedTradeflow);

      const result = await controller.remove('tradeflow-001', {
        user: mockUser,
      });

      expect(service.remove).toHaveBeenCalledWith('tradeflow-001', mockUser);
      expect(result).toEqual(deletedTradeflow);
    });

    it('deve lançar NotFoundException se o tradeflow não for encontrado', async () => {
      mockTradeflowService.remove.mockImplementation(() => {
        throw new NotFoundException('TradeFlow not found');
      });

      await expect(
        controller.remove('tradeflow-inexistente', { user: mockUser }),
      ).rejects.toThrow(NotFoundException);

      expect(service.remove).toHaveBeenCalledWith(
        'tradeflow-inexistente',
        mockUser,
      );
    });

    it('deve lançar UnauthorizedException se o usuário não for o dono do tradeflow', async () => {
      mockTradeflowService.remove.mockImplementation(() => {
        throw new UnauthorizedException('User not authorized');
      });

      await expect(
        controller.remove('tradeflow-001', { user: mockUser }),
      ).rejects.toThrow(UnauthorizedException);

      expect(service.remove).toHaveBeenCalledWith('tradeflow-001', mockUser);
    });
  });
});
