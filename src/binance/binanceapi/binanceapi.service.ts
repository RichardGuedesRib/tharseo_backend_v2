import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
const { Spot } = require('@binance/connector');
import NewOrder from '../dto/orders/new.order';
import CancelOrderRequest from '../dto/orders/cancel.order.request';
import GetOrdersRequest from '../dto/market/get.all.orders.request';
import CancelOpenOrdersRequest from '../dto/orders/cancel.open.order.request';
import { CheckOrder } from '../dto/orders/check-order.request';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class BinanceapiService {
  private readonly binanceBaseUrl = process.env.BINANCE_BASE_URL;
  private readonly logger = new Logger(BinanceapiService.name);

  constructor(
    @InjectMetric('binance_http_count')
    public counter: Counter<string>,
    @InjectMetric('binance_http_duration_seconds')
    private readonly binanceHttpDuration: Histogram<string>,
  ) {}

  /**
   * Busca informa es de gr fico de uma moeda
   *
   * @param symbol par de moedas para a busca
   * @param timeChart tipo de gr fico (ex: 1m, 1h, 1d)
   * @param limit quantidade de registros a serem buscados
   * @returns lista de informa es de gr fico
   * @throws InternalServerErrorException se houver erro ao buscar dados do gr fico
   */
  async getChartInfo(
    symbol: string,
    timeChart: string,
    limit: string,
  ): Promise<any> {
    const end = this.binanceHttpDuration.startTimer({ method: 'getChartInfo' });
    try {
      this.counter.inc({ method: 'getChartInfo' });
      const client = new Spot('', '', { baseURL: this.binanceBaseUrl });

      const response = await client.klines(symbol, timeChart, {
        limit: limit,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      return { success: false, message: error.message };
    } finally {
      end();
    }
  }

  /**
   * Busca todas as ordens de uma moeda
   *
   * @param apiKey chave de acesso a API da Binance
   * @param apiSecret chave secreta de acesso a API da Binance
   * @param symbol par de moedas para a busca
   * @returns lista de ordens
   * @throws InternalServerErrorException se houver erro ao buscar ordens
   */
  async getAllOrders(getAllOrdersRequest: GetOrdersRequest): Promise<any> {
    const end = this.binanceHttpDuration.startTimer({ method: 'getAllOrders' });
    try {
      this.counter.inc({ method: 'getAllOrders' });
      this.logger.log(`Buscando ordens para ${getAllOrdersRequest.symbol}`);
      const client = new Spot(
        getAllOrdersRequest.apiKey,
        getAllOrdersRequest.apiSecret,
        {
          baseURL: this.binanceBaseUrl,
        },
      );
      const response = await client.allOrders(getAllOrdersRequest.symbol);

      return response.data;
    } catch (error) {
      this.logger.log('Erro ao buscar todas ordens:', error);
      throw new InternalServerErrorException(
        `Erro ao buscar ordens: ${error.message}`,
      );
    } finally {
      end();
    }
  }

  /**
   * Abre uma ordem na Binance
   *
   * @param apiKey chave de acesso a API da Binance
   * @param apiSecret chave secreta de acesso a API da Binance
   * @param symbol par de moedas para a ordem
   * @param side lado da ordem (COMPRA ou VENDA)
   * @param typeOrder tipo de ordem (MARKET ou LIMIT)
   * @param price preco da ordem (somente para tipo LIMIT)
   * @param quantity quantidade da ordem
   * @returns dados da ordem aberta
   * @throws BadRequestException se o tipo de ordem for invalido
   * @throws InternalServerErrorException se houver erro ao abrir ordem
   */
  async newOrder(newOrder: NewOrder) {
    const end = this.binanceHttpDuration.startTimer({ method: 'newOrder' });
    this.counter.inc({ method: 'newOrder' });
    this.logger.log(
      `Pedido de ordem recebido: ${newOrder.symbol}, ${newOrder.side}, ${newOrder.typeOrder}, ${newOrder.price}, ${newOrder.quantity}`,
    );
    try {
      const client = new Spot(newOrder.apiKey, newOrder.apiSecret, {
        baseURL: this.binanceBaseUrl,
      });
      let response;
      if (newOrder.typeOrder === 'MARKET') {
        response = await client.newOrder(
          newOrder.symbol,
          newOrder.side,
          newOrder.typeOrder,
          {
            quantity: newOrder.quantity,
          },
        );
      } else if (newOrder.typeOrder === 'LIMIT') {
        response = await client.newOrder(
          newOrder.symbol,
          newOrder.side,
          newOrder.typeOrder,
          {
            price: newOrder.price,
            quantity: newOrder.quantity,
            timeInForce: 'GTC',
          },
        );
      } else {
        throw new BadRequestException('Tipo de ordem inválido');
      }

      this.logger.log(
        `Ordem Aberta na Binance:' ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Erro ao executar ordem',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException(
        `Erro ao abrir ordem: ${error.message}`,
      );
    } finally {
      end();
    }
  }

  /**
   * Cancela uma ordem na Binance
   *
   * @param cancelOrder dados para cancelar ordem
   * @returns dados da ordem cancelada
   * @throws InternalServerErrorException se houver erro ao cancelar ordem
   */
  async cancelOrder(cancelOrder: CancelOrderRequest) {
    const end = this.binanceHttpDuration.startTimer({ method: 'cencelOrder' });
    try {
      this.counter.inc({ method: 'cancelOrder' });
      this.logger.log(
        `Pedido de Cancelamento de Ordem recebido: ${cancelOrder.symbol}, ${cancelOrder.orderId},`,
      );

      const client = new Spot(cancelOrder.apiKey, cancelOrder.apiSecret, {
        baseURL: this.binanceBaseUrl,
      });
      const response = await client.cancelOrder(cancelOrder.symbol, {
        orderId: cancelOrder.orderId,
      });

      this.logger.log(
        'Pedido de cancelamento de ordem executado',
        response.data,
      );
      return response.data;
    } catch (error) {
      this.logger.log(
        `Erro ao cancelar ordem: ${cancelOrder.orderId}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        `Erro ao cancelar ordem: ${cancelOrder.orderId} : ${error.message}`,
      );
    } finally {
      end();
    }
  }

  /**
   * Cancela todas as ordens abertas de um par de moedas na Binance.
   *
   * @param cancelOpenOrdersRequest - Dados necessários para cancelar as ordens abertas,
   * incluindo a chave de API, chave secreta e o par de moedas.
   * @returns Dados das ordens abertas canceladas.
   * @throws InternalServerErrorException se houver erro ao cancelar as ordens abertas.
   */
  async cancelOpenOrders(cancelOpenOrdersRequest: CancelOpenOrdersRequest) {
    this.counter.inc({ method: 'cancelOpenOrders' });
    const end = this.binanceHttpDuration.startTimer({
      method: 'cencelOpenOrders',
    });
    try {
      const client = new Spot(
        cancelOpenOrdersRequest.apiKey,
        cancelOpenOrdersRequest.apiSecret,
        {
          baseURL: this.binanceBaseUrl,
        },
      );
      const response = await client.cancelOpenOrders(
        cancelOpenOrdersRequest.symbol,
      );
      this.logger.log(
        'Pedido de cancelamento de ordens abertas executado',
        response.data,
      );
      return response.data;
    } catch (error) {
      this.logger.log(
        `Erro ao cancelar ordens abertas: ${cancelOpenOrdersRequest.symbol}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        `Erro ao cancelar ordem: ${cancelOpenOrdersRequest.symbol} : ${error.message}`,
      );
    } finally {
      end();
    }
  }

  /**
   * Busca o preco de mercado atual de uma moeda na Binance.
   *
   * @param symbol par de moedas para a busca (ex: BTCUSDT)
   * @returns o pre o de mercado atual da moeda
   * @throws InternalServerErrorException se houver erro ao buscar o pre o de mercado
   */
  async getPriceMarket(symbol: string) {
    this.counter.inc({ method: 'getPriceMarket' });
    const end = this.binanceHttpDuration.startTimer({
      method: 'getPriceMarket',
    });
    try {
      const client = new Spot('', '', {
        baseURL: this.binanceBaseUrl,
      });

      const response = await client.tickerPrice(symbol);
      return response.data.price;
    } catch (error) {
      this.logger.error(
        `Erro ao obter preço de mercado para ${symbol}`,
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        `Erro ao obter preço de mercado para ${symbol}: ${error.message}`,
      );
    } finally {
      end();
    }
  }

  /**
   * Verifica o status de uma ordem específica na Binance.
   *
   * @param orderId ID da ordem para verificar.
   * @param symbol Par de moedas da ordem.
   * @param apiKey Chave de API da Binance.
   * @param apiSecret Chave secreta da API da Binance.
   * @returns Dados da ordem ou erro se a ordem não for encontrada.
   * @throws InternalServerErrorException se houver erro ao verificar a ordem.
   */
  async checkOrder(checkOrder: CheckOrder) {
    this.counter.inc({ method: 'checkOrder' });
    const end = this.binanceHttpDuration.startTimer({ method: 'checkOrder' });
    try {
      this.logger.log(
        `Verificando ordem: ${checkOrder.orderId}, ${checkOrder.symbol}`,
      );

      const client = new Spot(checkOrder.apiKey, checkOrder.apiSecret, {
        baseURL: this.binanceBaseUrl,
      });

      const response = await client.getOrder(checkOrder.symbol, {
        orderId: checkOrder.orderId,
      });

      this.logger.log(`Status da ordem:', ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      this.logger.error(
        'Erro ao verificar a ordem:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        `Erro ao verificar a ordem ${checkOrder.orderId} para ${checkOrder.symbol}: ${error.message}`,
      );
    } finally {
      end();
    }
  }

  /**
   * Verifica a conectividade com a API Binance através de um ping.
   *
   * @returns Um objeto indicando o sucesso ou falha do ping.
   *          - { success: true, message: 'Ping sucesso' } em caso de sucesso.
   *          - { error: true, message: 'Erro ao conectar' } em caso de falha.
   * @throws Error logado no console em caso de falha de ping.
   */

  async checkConnection() {
    const end = this.binanceHttpDuration.startTimer({
      method: 'checkConnection',
    });
    this.counter.inc({ method: 'checkConnection' });
    const client = new Spot('', '', { baseURL: this.binanceBaseUrl });

    try {
      const response = await client.ping();
      console.log('Ping sucesso:', response.statusText);
      return {
        success: true,
        message: 'Ping sucesso',
      };
    } catch (error) {
      console.error('Erro no ping:', error);
      return {
        error: true,
        message: 'Erro ao conectar',
      };
    } finally {
      end();
    }
  }
}
