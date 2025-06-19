import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { AssetService } from '../asset/asset.service';
import { BinanceapiService } from '../binance/binanceapi/binanceapi.service';
import { PrismaService } from '../database/prisma.service';
import { TokenPayload } from '../auth/dtos/token.payload';
import { CreateOrderDto } from './dto/create-order.dto';
import NewOrder from 'src/binance/dto/orders/new.order';
import { NotFoundException } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;
  let userService: UserService;
  let assetService: AssetService;
  let binanceApiService: BinanceapiService;

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
    credential: {
      apiKey: 'mock-api-key',
      secretKey: 'mock-secret-key',
    },
  };

  const mockAsset = {
    id: 'asset-123',
    symbol: 'symbol-asset',
    name: 'symbol description',
    isActive: true,
  };

  const mockSendOrderExchange = {
    status: 'FILLED',
    orderId: 123456,
    executedQty: '10',
    fills: [
      {
        price: '100.00',
      },
    ],
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

  const orderCreatedMock = {
    id: 'order-id-123',
    assetId: createOrderDTO.assetId,
    userId: createOrderDTO.userId,
    openDate: expect.any(Date),
    closeDate: expect.any(Date),
    openPrice: '100.00',
    closePrice: '100.00',
    quantity: '10',
    side: createOrderDTO.side,
    status: 'EXECUTADA',
    typeOrder: createOrderDTO.typeOrder,
    targetPrice: '10',
    isActive: true,
    idOrderExchange: '123456',
  };

  const createOnDatabaseMock = {
    assetId: 'asset-123',
    pairOrderId: 'pair-456',
    quantity: '10',
    userId: 'user-123',
    strategyId: 'strategy-123',
    openDate: new Date(),
    closeDate: new Date(),
    openPrice: '100',
    closePrice: '200',
    typeOrder: 'MARKET',
    targetPrice: '100',
    isActive: true,
    idOrderExchange: 'binance-123',
    side: 'BUY',
    status: 'EXECUTADA',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        {
          provide: AssetService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: BinanceapiService,
          useValue: {
            newOrder: jest.fn(),
            cancelOpenOrders: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
            strategy: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    assetService = module.get<AssetService>(AssetService);
    binanceApiService = module.get<BinanceapiService>(BinanceapiService);
  });

  it('order service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma order com sucesso', async () => {
      (assetService.findOne as jest.Mock).mockResolvedValue(mockAsset);
      (userService.getUserById as jest.Mock).mockResolvedValue({
        ...mockUser,
        credential: { apiKey: 'apikey-user', secretKey: 'apisecret-user' },
      });
      (binanceApiService.newOrder as jest.Mock).mockResolvedValue(
        mockSendOrderExchange,
      );

      (prisma.order.create as jest.Mock).mockResolvedValue(orderCreatedMock);

      const result = await service.create(createOrderDTO, tokenPayloadMock);

      expect(result).toEqual(orderCreatedMock);
    });

    it('deve lançar NotFoundException se asset não for encontrado', async () => {
      (assetService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(createOrderDTO, tokenPayloadMock),
      ).rejects.toThrow('Asset not found');
    });

    it('deve lançar NotFoundException se user não for encontrado', async () => {
      (assetService.findOne as jest.Mock).mockResolvedValue(mockAsset);
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(createOrderDTO, tokenPayloadMock),
      ).rejects.toThrow('User not found');
    });

    it('deve lançar ServiceUnavailableException se status da ordem não for FILLED', async () => {
      (assetService.findOne as jest.Mock).mockResolvedValue(mockAsset);
      (userService.getUserById as jest.Mock).mockResolvedValue({
        ...mockUser,
        credential: { apiKey: 'apikey-user', secretKey: 'apisecret-user' },
      });

      const responseOrderNotFilled = { status: 'REJECTED' };

      (binanceApiService.newOrder as jest.Mock).mockResolvedValue(
        responseOrderNotFilled,
      );

      await expect(
        service.create(createOrderDTO, tokenPayloadMock),
      ).rejects.toThrow('Order not created');
    });

    it('deve lançar erro se prisma.order.create falhar', async () => {
      (assetService.findOne as jest.Mock).mockResolvedValue(mockAsset);
      (userService.getUserById as jest.Mock).mockResolvedValue({
        ...mockUser,
        credential: { apiKey: 'apikey-user', secretKey: 'apisecret-user' },
      });

      (binanceApiService.newOrder as jest.Mock).mockResolvedValue(
        mockSendOrderExchange,
      );

      (prisma.order.create as jest.Mock).mockRejectedValue(
        new Error('Erro ao salvar'),
      );

      await expect(
        service.create(createOrderDTO, tokenPayloadMock),
      ).rejects.toThrow('Erro ao salvar');
    });
  });

  describe('createOnDatabase', () => {
    it('deve criar uma order com sucesso', async () => {
      (assetService.findOne as jest.Mock).mockResolvedValue(mockAsset);
      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const expectCreate = {
        id: 'order-123',
        ...createOnDatabaseMock,
      };

      (prisma.order.create as jest.Mock).mockResolvedValue(expectCreate);

      const result = await service.createOnDatabase(createOnDatabaseMock);

      expect(result).toEqual(expectCreate);
    });

    it('deve lançar NotFoundException se asset nao for encontrado', async () => {
      (assetService.findOne as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.createOnDatabase(createOnDatabaseMock),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se user nao for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.createOnDatabase(createOnDatabaseMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as orders de um usuario', async () => {
      const orders = [
        { id: 1, userId: tokenPayloadMock.userId },
        { id: 2, userId: tokenPayloadMock.userId },
        { id: 3, userId: tokenPayloadMock.userId },
      ];

      (prisma.order.findMany as jest.Mock).mockResolvedValue(orders);

      const result = await service.findAll(tokenPayloadMock);

      expect(result).toEqual(orders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          userId: tokenPayloadMock.userId,
        },
        include: {
          strategy: true,
          asset: true,
        },
        orderBy: {
          openDate: 'desc',
        },
      });
      expect(result.length).toBe(3);
    });

    it('deve retornar um array vazio se o usuario nao tiver orders', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue([]);
      const result = await service.findAll(tokenPayloadMock);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma order', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(
        createOnDatabaseMock,
      );

      const result = await service.findOne('order-id', tokenPayloadMock);

      expect(result).toEqual(createOnDatabaseMock);
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-id', userId: 'user-123' },
      });
      expect(result.userId).toBe(tokenPayloadMock.userId);
    });

    it('deve retornar NotFoundException se a order nao for encontrada', async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.findOne('order-id', tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma order', async () => {
      const updateOrderMock: UpdateOrderDto = {
        status: 'ATUALIZADA',
      };

      const existingOrder = {
        id: 'order-id',
        status: 'PENDENTE',
        userId: tokenPayloadMock.userId,
      };

      (prisma.order.findFirst as jest.Mock).mockResolvedValue(existingOrder);
      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...existingOrder,
        ...updateOrderMock,
      });

      const result = await service.update(
        'order-id',
        updateOrderMock,
        tokenPayloadMock,
      );

      expect(result).toEqual({
        ...existingOrder,
        ...updateOrderMock,
      });
    });

    it('deve retornar NotFoundException se a order nao for encontrada', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('order-id', { status: 'ATUALIZADA' }, tokenPayloadMock),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateIdPairOrder', () => {
    it('deve atualizar uma order com atribuição de pairOrderId', async () => {
      const id = 'order-id';
      const idPairOrder = 'pair-order-id';

      (prisma.order.update as jest.Mock).mockResolvedValue({
        id,
        pairOrderId: idPairOrder,
      });

      const result = await service.updateIdPairOrder(id, idPairOrder);

      expect(result).toEqual({
        id,
        pairOrderId: idPairOrder,
      });
    });
  });

  describe('getPendingOrdersCreated', () => {
    it('deve retornar uma lista de orders pendentes', async () => {
      const orders = [
        { id: 1, status: 'PENDENTE' },
        { id: 2, status: 'PENDENTE' },
        { id: 3, status: 'PENDENTE' },
      ];

      (prisma.order.findMany as jest.Mock).mockResolvedValue(orders);

      const result = await service.getPendingOrdersCreated();

      expect(result).toEqual(orders);
      expect(result.length).toBe(3);
    });
  });

  describe('updateOrderFromCheckExchange', () => {
    it('deve atualizar a ordem e a estratégia se order tiver result, strategyId e performance', async () => {
      const updateOrderMock: UpdateOrderDto = {
        result: '100',
        strategyId: 'strategy-id',
        performance: '20',
        status: 'FECHADA',
      };

      const existingStrategy = {
        id: 'strategy-id',
        name: 'Estrategia X',
        profit: '200',
        performance: '50',
      };

      const updatedStrategy = {
        ...existingStrategy,
        profit: '300',
        performance: '70',
      };

      (prisma.order.update as jest.Mock).mockResolvedValue(undefined);
      (prisma.strategy.findFirst as jest.Mock).mockResolvedValue(
        existingStrategy,
      );
      (prisma.strategy.update as jest.Mock).mockResolvedValue(updatedStrategy);

      const loggerMock = { log: jest.fn() };

      (service as any).logger = loggerMock;

      await service.updateOrderFromCheckExchange('order-id', updateOrderMock);

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'order-id' },
          data: expect.objectContaining({
            result: '100',
            strategyId: 'strategy-id',
            status: 'FECHADA',
          }),
        }),
      );

      expect(prisma.strategy.update).toHaveBeenCalledWith({
        where: { id: 'strategy-id' },
        data: {
          profit: '300',
          performance: '70',
        },
      });

      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining('possui o novo profit de 300'),
      );
      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining('possui a nova performance de 70'),
      );
    });
  });

  describe('cancelOpenOrders', () => {
    it('deve cancelar ordens abertas do usuário e atualizar o status para CANCELADO', async () => {
      const mockSymbols = [
        { asset: { symbol: 'BTCUSDT' } },
        { asset: { symbol: 'ETHUSDT' } },
      ];

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockSymbols);
      (binanceApiService.cancelOpenOrders as jest.Mock).mockResolvedValue(
        undefined,
      );
      (prisma.order.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      const loggerMock = { log: jest.fn() };
      (service as any).logger = loggerMock;

      const response = await service.cancelOpenOrders(tokenPayloadMock);

      expect(userService.getUserById).toHaveBeenCalledWith('user-123');
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDENTE',
          asset: {
            symbol: { not: 'USDT' },
          },
        },
        select: {
          asset: {
            select: { symbol: true },
          },
        },
        distinct: ['assetId'],
      });

      expect(binanceApiService.cancelOpenOrders).toHaveBeenCalledTimes(2);
      expect(binanceApiService.cancelOpenOrders).toHaveBeenCalledWith({
        apiKey: 'mock-api-key',
        apiSecret: 'mock-secret-key',
        symbol: 'BTCUSDT',
      });
      expect(binanceApiService.cancelOpenOrders).toHaveBeenCalledWith({
        apiKey: 'mock-api-key',
        apiSecret: 'mock-secret-key',
        symbol: 'ETHUSDT',
      });

      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDENTE',
          userId: 'user-123',
        },
        data: {
          status: 'CANCELADO',
        },
      });

      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Pedido de cancelamento de ordens em abertas recebeido',
        ),
      );
      expect(loggerMock.log).toHaveBeenCalledWith(
        expect.stringContaining('Ordens canceladas para o usuário'),
      );

      expect(response).toEqual({
        success: true,
        message: 'Ordens canceladas com sucesso',
      });
    });
  });
});
