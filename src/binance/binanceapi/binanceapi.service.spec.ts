import { Test, TestingModule } from '@nestjs/testing';
import { BinanceapiService } from './binanceapi.service';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Spot } from '@binance/connector';
import { MetricsModule } from '../../metrics/metrics.module';

jest.mock('@binance/connector', () => {
  return {
    Spot: jest.fn().mockImplementation(() => ({
      allOrders: jest.fn(),
      newOrder: jest.fn(),
      cancelOrder: jest.fn(),
      cancelOpenOrders: jest.fn(),
    })),
  };
});

const mockCounter = {
  inc: jest.fn(),
};

const mockHistogram = {
  startTimer: jest.fn().mockReturnValue(jest.fn()),
};

describe('BinanceapiService', () => {
  let service: BinanceapiService;
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BinanceapiService,
        {
          provide: MetricsModule,
          useValue: {
            mockCounter,
            mockHistogram,
          },
        },
        {
          provide: 'PROM_METRIC_BINANCE_HTTP_COUNT',
          useValue: mockCounter, 
        },
        {
          provide: 'PROM_METRIC_BINANCE_HTTP_DURATION_SECONDS',
          useValue: mockHistogram,
        },
      ],
    })
      .overrideProvider(Logger)
      .useValue(mockLogger)
      .compile();

    service = module.get<BinanceapiService>(BinanceapiService);
    (service as any).logger = mockLogger;
    (service as any).binanceBaseUrl = 'https://api.binance.com';
  });

  it('binanceapi service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  describe('getAllOrders', () => {
    it('deve buscar todas as ordens com sucesso', async () => {
      const mockOrders = { data: [{ id: 1, symbol: 'BTCUSDT' }] };
      const mockAllOrders = jest.fn().mockResolvedValue(mockOrders);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        allOrders: mockAllOrders,
      }));

      const getAllOrdersRequest = {
        symbol: 'BTCUSDT',
        apiKey: 'testkey',
        apiSecret: 'testsecret',
      };

      const result = await service.getAllOrders(getAllOrdersRequest);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Buscando ordens para BTCUSDT',
      );
      expect(result).toEqual(mockOrders.data);
      expect(mockAllOrders).toHaveBeenCalledWith('BTCUSDT');
    });

    it('deve lançar exceção se der erro ao buscar ordens', async () => {
      const mockError = new Error('Erro de conexão');
      const mockAllOrders = jest.fn().mockRejectedValue(mockError);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        allOrders: mockAllOrders,
      }));

      const getAllOrdersRequest = {
        symbol: 'BTCUSDT',
        apiKey: 'testkey',
        apiSecret: 'testsecret',
      };

      await expect(service.getAllOrders(getAllOrdersRequest)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Erro ao buscar todas ordens:',
        mockError,
      );
    });
  });

  describe('newOrder', () => {
    it('deve executar uma ordem MARKET com sucesso', async () => {
      const mockResponse = { data: { orderId: 123 } };
      const mockNewOrder = jest.fn().mockResolvedValue(mockResponse);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        newOrder: mockNewOrder,
      }));

      const orderRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
        side: 'BUY',
        typeOrder: 'MARKET',
        quantity: '0.1',
        price: '100',
      };

      const result = await service.newOrder(orderRequest);

      expect(mockNewOrder).toHaveBeenCalledWith('BTCUSDT', 'BUY', 'MARKET', {
        quantity: '0.1',
      });

      expect(result).toEqual(mockResponse.data);
    });

    it('deve executar uma ordem LIMIT com sucesso', async () => {
      const mockResponse = { data: { orderId: 456 } };
      const mockNewOrder = jest.fn().mockResolvedValue(mockResponse);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        newOrder: mockNewOrder,
      }));

      const orderRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
        side: 'SELL',
        typeOrder: 'LIMIT',
        quantity: '0.5',
        price: '60000',
      };

      const result = await service.newOrder(orderRequest);

      expect(mockNewOrder).toHaveBeenCalledWith('BTCUSDT', 'SELL', 'LIMIT', {
        price: '60000',
        quantity: '0.5',
        timeInForce: 'GTC',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar BadRequestException se tipo de ordem for inválido', async () => {
      const orderRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
        side: 'BUY',
        typeOrder: 'STOP',
        quantity: '0.2',
        price: '50000',
      };

      await expect(service.newOrder(orderRequest)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('deve lançar InternalServerErrorException se houver erro na execução', async () => {
      const mockError = {
        message: 'Erro inesperado',
        response: {
          data: 'Erro do servidor da Binance',
        },
      };
      const mockNewOrder = jest.fn().mockRejectedValue(mockError);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        newOrder: mockNewOrder,
      }));

      const orderRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
        side: 'BUY',
        typeOrder: 'MARKET',
        quantity: '0.1',
        price: '100',
      };

      await expect(service.newOrder(orderRequest)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('cancelOrder', () => {
    it('deve cancelar uma ordem com sucesso', async () => {
      const mockResponse = { data: { status: 'CANCELED', orderId: 456 } };
      const mockCancelOrder = jest.fn().mockResolvedValue(mockResponse);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        cancelOrder: mockCancelOrder,
      }));

      const cancelOrderRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
        orderId: 456,
      };

      const result = await service.cancelOrder(cancelOrderRequest);

      expect(mockCancelOrder).toHaveBeenCalledWith('BTCUSDT', {
        orderId: 456,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar exceção ao falhar no cancelamento da ordem', async () => {
      const mockError = {
        message: 'Erro de cancelamento',
        response: {
          data: { code: -2011, msg: 'Unknown order sent.' },
        },
      };

      const mockCancelOrder = jest.fn().mockRejectedValue(mockError);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        cancelOrder: mockCancelOrder,
      }));

      const cancelOrderRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
        orderId: 456,
      };

      await expect(service.cancelOrder(cancelOrderRequest)).rejects.toThrow(
        `Erro ao cancelar ordem: 456 : ${mockError.message}`,
      );
    });
  });

  describe('cancelOpenOrders', () => {
    it('deve cancelar todas as ordens abertas com sucesso', async () => {
      const mockResponse = { data: [{ orderId: 123 }, { orderId: 456 }] };
      const mockCancelOpenOrders = jest.fn().mockResolvedValue(mockResponse);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        cancelOpenOrders: mockCancelOpenOrders,
      }));

      const cancelOpenOrdersRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
      };

      const result = await service.cancelOpenOrders(cancelOpenOrdersRequest);

      expect(mockCancelOpenOrders).toHaveBeenCalledWith('BTCUSDT');
      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar exceção ao falhar no cancelamento de ordens abertas', async () => {
      const mockError = {
        message: 'Erro ao cancelar ordens',
        response: {
          data: { code: -2011, msg: 'Unknown error occurred.' },
        },
      };

      const mockCancelOpenOrders = jest.fn().mockRejectedValue(mockError);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        cancelOpenOrders: mockCancelOpenOrders,
      }));

      const cancelOpenOrdersRequest = {
        apiKey: 'testkey',
        apiSecret: 'testsecret',
        symbol: 'BTCUSDT',
      };

      await expect(
        service.cancelOpenOrders(cancelOpenOrdersRequest),
      ).rejects.toThrow(
        `Erro ao cancelar ordem: BTCUSDT : ${mockError.message}`,
      );
    });
  });

  describe('getPriceMarket', () => {
    it('deve retornar o preço de mercado com sucesso', async () => {
      const mockResponse = { data: { price: '28000.50' } };
      const mockTickerPrice = jest.fn().mockResolvedValue(mockResponse);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        tickerPrice: mockTickerPrice,
      }));

      const symbol = 'BTCUSDT';
      const result = await service.getPriceMarket(symbol);

      expect(mockTickerPrice).toHaveBeenCalledWith(symbol);
      expect(result).toBe('28000.50');
    });

    it('deve lançar exceção ao falhar ao buscar preço de mercado', async () => {
      const mockError = {
        message: 'Erro de conexão',
        response: {
          data: { code: -1003, msg: 'Too many requests' },
        },
      };

      const mockTickerPrice = jest.fn().mockRejectedValue(mockError);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        tickerPrice: mockTickerPrice,
      }));

      const symbol = 'BTCUSDT';

      await expect(service.getPriceMarket(symbol)).rejects.toThrow(
        `Erro ao obter preço de mercado para ${symbol}: ${mockError.message}`,
      );
    });
  });

  describe('checkOrder', () => {
    it('deve verificar o status da ordem com sucesso', async () => {
      const mockResponse = { data: { status: 'FILLED', orderId: '123' } };
      const mockGetOrder = jest.fn().mockResolvedValue(mockResponse);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        getOrder: mockGetOrder,
      }));

      const checkOrder = {
        apiKey: 'testKey',
        apiSecret: 'testSecret',
        symbol: 'BTCUSDT',
        orderId: '123',
      };

      const result = await service.checkOrder(checkOrder);

      expect(mockGetOrder).toHaveBeenCalledWith('BTCUSDT', { orderId: '123' });
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Verificando ordem: ${checkOrder.orderId}, ${checkOrder.symbol}`,
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Status da ordem:', ${JSON.stringify(mockResponse.data)}`,
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('deve lançar exceção ao falhar ao verificar a ordem', async () => {
      const mockError = {
        message: 'Ordem não encontrada',
        response: {
          data: { code: -2013, msg: 'Order does not exist' },
        },
      };

      const mockGetOrder = jest.fn().mockRejectedValue(mockError);

      // @ts-ignore
      Spot.mockImplementation(() => ({
        getOrder: mockGetOrder,
      }));

      const checkOrder = {
        apiKey: 'testKey',
        apiSecret: 'testSecret',
        symbol: 'BTCUSDT',
        orderId: '999',
      };

      await expect(service.checkOrder(checkOrder)).rejects.toThrow(
        `Erro ao verificar a ordem ${checkOrder.orderId} para ${checkOrder.symbol}: ${mockError.message}`,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Erro ao verificar a ordem:',
        mockError.response.data,
      );
    });
  });
});
