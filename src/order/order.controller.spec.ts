import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/auth.guard';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const tokenPayloadMock: TokenPayload = {
    userId: 'user-123',
    levelUser: 'admin',
    userName: 'alunodsm',
    isActive: true,
  };

  const createOrderDTO: CreateOrderDto = {
    assetId: 'asset-123',
    pairOrderId: 'pair-456',
    quantity: '10',
    quantityType: 'FIXED',
    side: 'BUY',
    userId: 'user-123',
    openDate: new Date(),
    closeDate: new Date(),
    closePrice: '10',
    typeOrder: 'MARKET',
    targetPrice: '10',
    stopPrice: '10',
    status: 'EXECUTADA',
    isActive: true,
    idOrderExchange: 'binance-123',
    result: '35',
    strategyId: 'strategy-123',
    performance: '20.5',
  };

  const updateOrderDTO: UpdateOrderDto = {
    status: 'CANCELADA',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            cancelOpenOrders: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('order controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um pedido', async () => {
      const orderExpected = {
        id: 'order-123',
        ...createOrderDTO,
      };
      (service.create as jest.Mock).mockResolvedValue(orderExpected);

      const result = await service.create(createOrderDTO, tokenPayloadMock);
      expect(result).toEqual(orderExpected);
    });

    it('deve lançar um NotFoundException se o usuario nao for encontrado', async () => {
      (service.create as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(
        service.create(createOrderDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de orders', async () => {
      const orders = [
        { id: 'order-1', userId: 'user-123' },
        { id: 'order-2', userId: 'user-123' },
      ];
      (service.findAll as jest.Mock).mockResolvedValue(orders);

      const result = await service.findAll(tokenPayloadMock);
      expect(result).toEqual(orders);
      expect(result.length).toBe(2);
    });
  });

  describe('findOne', () => {
    it('deve retornar um order', async () => {
      const order = { id: 'order-1', userId: 'user-123' };
      (service.findOne as jest.Mock).mockResolvedValue(order);

      const result = await service.findOne('order-1', tokenPayloadMock);
      expect(result).toEqual(order);
    });

    it('deve retornar um NotFoundException se o order nao for encontrado', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException(''),
      );

      await expect(
        service.findOne('order-1', tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar um NotFoundException se o usuario nao for encontrado', async () => {
      (service.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      await expect(
        service.findOne('order-1', tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma ordem', async () => {
      const expectedOrder = {
        id: 'order-1',
        ...updateOrderDTO,
      };
      (service.update as jest.Mock).mockResolvedValue(expectedOrder);

      const result = await service.update(
        'order-1',
        updateOrderDTO,
        tokenPayloadMock,
      );
      expect(result).toEqual(expectedOrder);
    });

    it('deve retornar um NotFoundException se o order nao for encontrado', async () => {
      (service.update as jest.Mock).mockRejectedValue(
        new NotFoundException('Order not found'),
      );
      await expect(
        service.update('order-1', updateOrderDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve retornar um NotFoundException se o usuario nao for encontrado', async () => {
      (service.update as jest.Mock).mockRejectedValue(
        new NotFoundException('User not found'),
      );
      await expect(
        service.update('order-1', updateOrderDTO, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOpenOrders', () => {
    it('deve cancelar todas as ordens abertas', async () => {
      (service.cancelOpenOrders as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Ordens canceladas com sucesso',
      });

      const result = await service.cancelOpenOrders(tokenPayloadMock);
      expect(result).toEqual({
        success: true,
        message: 'Ordens canceladas com sucesso',
      });
      expect(result.success).toBe(true);
    });

    it('deve retornar um NotFoundException se o usuario nao for encontrado', async () => {
      (service.cancelOpenOrders as jest.Mock).mockRejectedValue(new NotFoundException('User not found'));
      await expect(service.cancelOpenOrders(tokenPayloadMock)).rejects.toThrow(NotFoundException);
    });
  });
});
