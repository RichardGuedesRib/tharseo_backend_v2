import { Test, TestingModule } from '@nestjs/testing';
import { EngineTharseoService } from './engine-tharseo.service';
import { BinanceapiService } from '../binance/binanceapi/binanceapi.service';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderExchangeRequest } from './dto/create-order-exchange-request';
import NewOrder from 'src/binance/dto/orders/new.order';

describe('EngineTharseoService', () => {
  let service: EngineTharseoService;
  let prisma: PrismaService;
  let binanceApiService: BinanceapiService;
  let orderService: OrderService;

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    name: 'User Test',
    password: 'hashed-password',
  };

  const openOrdersMock = [
    {
      id: 'order-id-123',
      assetId: 'asset-123',
      userId: mockUser.id,
      openDate: expect.any(Date),
      closeDate: expect.any(Date),
      openPrice: '100.00',
      closePrice: '100.00',
      quantity: '10',
      side: 'SELL',
      status: 'PENDENTE',
      typeOrder: 'MARKET',
      targetPrice: '10',
      isActive: true,
      idOrderExchange: '123456',
    },
    {
      id: 'order-id-123',
      assetId: 'asset-123',
      userId: mockUser.id,
      openDate: expect.any(Date),
      closeDate: expect.any(Date),
      openPrice: '100.00',
      closePrice: '100.00',
      quantity: '10',
      side: 'SELL',
      status: 'PENDENTE',
      typeOrder: 'MARKET',
      targetPrice: '10',
      isActive: true,
      idOrderExchange: '123456',
    },
  ];

  const tradeflowsActiveMock = [
    {
      assetId: 'asset-123',
      strategyId: 'strategy-123',
      isActive: true,
      strategy: {
        id: 'strategy-123',
        userId: 'user-123',
        user: {
          id: 'user-123',
          email: 'user@example.com',
          name: 'User Test',
          password: 'hashed-password',
          credential: {
            id: 'credential-123',
            apiKey: 'api-key-123',
            secretKey: 'secret-key-123',
          },
        },
      },
      asset: {
        id: 'asset-123',
        symbol: 'symbol-asset',
      },
    },
  ];

  const sendExchangeOrderMock: CreateOrderExchangeRequest = {
    apiKey: 'api-key-123',
    secretKey: 'secret-key-123',
    symbol: 'symbol-asset',
    side: 'BUY',
    typeOrder: 'MARKET',
    price: '100.00',
    quantity: '1',
    target: '120.00',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngineTharseoService,
        {
          provide: BinanceapiService,
          useValue: {
            newOrder: jest.fn(),
          },
        },
        {
          provide: OrderService,
          useValue: {
            findOne: jest.fn(),
            createOnDatabase: jest.fn(),
            updateIdPairOrder: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            findOne: jest.fn(),
            order: {
              findMany: jest.fn(),
            },
            tradeflow: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EngineTharseoService>(EngineTharseoService);
    prisma = module.get<PrismaService>(PrismaService);
    binanceApiService = module.get<BinanceapiService>(BinanceapiService);
    orderService = module.get<OrderService>(OrderService);
  });

  it('enginetharseo service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  describe('getOpenOrders', () => {
    it('deve retornar as ordens de venda pendentes', async () => {
      (prisma.order.findMany as jest.Mock).mockResolvedValue(openOrdersMock);
      const result = await service.getOpenOrders();
      expect(result).toEqual(openOrdersMock);
      expect(result.length).toBe(2);
    });
  });

  describe('getActivesTradeflow', () => {
    it('deve retornar os tradeflows ativos', async () => {
      (prisma.tradeflow.findMany as jest.Mock).mockResolvedValue(
        tradeflowsActiveMock,
      );
      const result = await service.getActivesTradeflow();
      expect(result).toEqual(tradeflowsActiveMock);
      expect(result.length).toBe(1);
    });
  });

  describe('sendExchangeOrder', () => {
    it('deve enviar a ordem para a exchange', async () => {
      (binanceApiService.newOrder as jest.Mock).mockResolvedValue(
        sendExchangeOrderMock,
      );

      const newOrder = await service.sendExchangeOrder(sendExchangeOrderMock);
      expect(newOrder).toEqual(sendExchangeOrderMock);
    });
  });

  describe('createOrder', () => {
    it('deve criar uma nova ordem', async () => {
      (binanceApiService.newOrder as jest.Mock).mockResolvedValue(
        sendExchangeOrderMock,
      );

      const sendOrder = await service.sendExchangeOrder(sendExchangeOrderMock);
      expect(sendOrder).toEqual(sendExchangeOrderMock);

      const orderCreatedMock = {
        assetId: tradeflowsActiveMock[0].assetId,
        userId:  tradeflowsActiveMock[0].strategy.userId,
        openDate: expect.any(Date),
        closeDate: expect.any(Date),
        openPrice: '100.00',
        closePrice: '100.00',
        quantity: '10',
        side: sendExchangeOrderMock.side,
        status: 'EXECUTADA',
        typeOrder: sendExchangeOrderMock.typeOrder,
        targetPrice: '10',
        isActive: true,
        idOrderExchange: '123456',
        strategyId: 'strategy-123',
      };

      const expectedOrder = {
        id: 'order-id-123',
        ...orderCreatedMock
      };

      (orderService.createOnDatabase as jest.Mock).mockResolvedValue(expectedOrder);
      const createBuyOrder = await orderService.createOnDatabase(orderCreatedMock);
      expect(createBuyOrder).toEqual(expectedOrder);

      const orderCreatedSellMock = {
        ...orderCreatedMock,
        side: 'SELL'       
      }

      const expectedOrderSell = {
        id: 'order-id-123',
        ...orderCreatedSellMock
      };
      (orderService.createOnDatabase as jest.Mock).mockResolvedValue(expectedOrderSell);
      const createSellOrder = await orderService.createOnDatabase(orderCreatedSellMock);
      expect(createSellOrder).toEqual(expectedOrderSell);

      
      (orderService.updateIdPairOrder as jest.Mock).mockResolvedValue({
        id: expectedOrder.id, 
        pairOrderId: expectedOrderSell.id,
      });

      const resultUpdateOrder = await orderService.updateIdPairOrder(expectedOrder.id, expectedOrderSell.id);

      expect(resultUpdateOrder).toEqual({
        id:expectedOrder.id,
        pairOrderId: expectedOrder.id,
      });

    });
  });
});
