import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
const { Spot } = require('@binance/connector');
import NewOrder from '../dto/orders/new.order';
import NewOcoOrder from '../dto/orders/new.oco.order';
import CancelOrderRequest from '../dto/orders/cancel.order.request';
import GetOrdersRequest from '../dto/market/get.all.orders.request';
import CancelOpenOrdersRequest from '../dto/orders/cancel.open.order.request';

@Injectable()
export class BinanceapiService {
  private readonly binanceBaseUrl = process.env.BINANCE_BASE_URL;
  private readonly logger = new Logger(BinanceapiService.name);

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
    try {
      const client = new Spot('', '', { baseURL: this.binanceBaseUrl });

      const response = await client.klines(symbol, timeChart, {
        limit: limit,
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
      return { success: false, message: error.message };
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
    try {
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

      this.logger.log('Ordem Aberta na Binance', response.data);

      return response.data;
    } catch (error) {
      this.logger.error(
        'Erro ao executar ordem',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException(
        `Erro ao abrir ordem: ${error.message}`,
      );
    }
  }

  /**
   * Abre uma ordem OCO na Binance
   *
   * @param newOcoOrder dados da ordem OCO
   * @returns dados da ordem OCO aberta
   * @throws BadRequestException se o tipo de ordem for invalido
   * @throws InternalServerErrorException se houver erro ao abrir ordem OCO
   */
  async newOcoOrder(newOcoOrder: NewOcoOrder) {
    this.logger.log(
      `Pedido de ordem oco recebido: ${newOcoOrder.symbol}, ${newOcoOrder.side}, ${newOcoOrder.price}, ${newOcoOrder.takeProfit}, ${newOcoOrder.takeProfitLimit} ${newOcoOrder.quantity}`,
    );
    try {
      const client = new Spot(newOcoOrder.apiKey, newOcoOrder.apiSecret, {
        baseURL: this.binanceBaseUrl,
      });

      const getprice = await client.tickerPrice('BNBUSDT');
      console.log('BNBRPICE', getprice.data);

      const response = await client.newOCOOrder(
        newOcoOrder.symbol,
        newOcoOrder.side,
        newOcoOrder.quantity,
        'LIMIT_MAKER',
        'STOP_LOSS_LIMIT',
        {
          abovePrice: newOcoOrder.price,
          belowPrice: newOcoOrder.takeProfit,
          belowStopPrice: newOcoOrder.takeProfitLimit,
          belowTimeInForce: 'GTC',
        },
      );

      this.logger.log('Ordem Oco Aberta na Binance', response.data);

      return response.data;
    } catch (error) {
      this.logger.error(
        'Erro ao executar ordem Oco',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException(
        `Erro ao abrir ordem: ${error.message}`,
      );
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
    try {
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
    }
  }
}
