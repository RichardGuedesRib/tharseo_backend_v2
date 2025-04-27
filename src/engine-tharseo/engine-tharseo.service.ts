import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { BinanceapiService } from '../binance/binanceapi/binanceapi.service';
import NewOrder from '../binance/dto/orders/new.order';
import { CreateOrderExchangeRequest } from './dto/create-order-exchange-request';
import { OrderService } from '../order/order.service';
import { CreateOrderDatabaseDto } from '../order/dto/create-order-database.dto';
import { CheckOrder } from '../binance/dto/orders/check-order.request';
import { UpdateOrderDto } from '../order/dto/update-order.dto';
import { Interval } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EngineTharseoService {
  private prisma: PrismaService;
  private readonly logger = new Logger(EngineTharseoService.name);
  private readonly binanceApiService: BinanceapiService;
  private readonly orderService: OrderService;

  constructor(
    prisma: PrismaService,
    binanceApiService: BinanceapiService,
    orderService: OrderService,
    private readonly configService: ConfigService,
  ) {
    this.prisma = prisma;
    this.binanceApiService = binanceApiService;
    this.orderService = orderService;
  }

  /**
   * Inicia o motor da estratégia Tharseo.
   *
   * Esta função é responsável por iniciar o motor da estratégia Tharseo.
   * Ela recupera todas as Tradeflows ativas e, para cada uma delas,
   * verifica se o número de ordens abertas é menor que o limite
   * estabelecido na configuração da estratégia. Caso sim, envia
   * novas ordens de compra com o valor estabelecido na configuração
   * e com o preço de compra calculado com base no preço de mercado
   * atual e na variável de ordem. Além disso, calcula o preço de venda
   * com base no preço de compra e no lucro alvo estabelecido na
   * configuração.
   */
  async startEngineTharseo() {
    this.logger.log('Iniciando Engine Tharseo');

    const activesTradeflow = await this.getActivesTradeflow();
    this.logger.log(
      `Tradeflows Ativos Localizados: [${activesTradeflow.length}]`,
    );

    activesTradeflow.forEach(async (tradeflow) => {
      const config = JSON.parse(tradeflow.strategy.configStrategy!);
      const asset = tradeflow.asset.symbol;
      const ordersOpen = await this.getOpenOrders();
      const profitTarget = config.profitTarget;
      const variableOrder = config.variableOrder;

      if (ordersOpen.length >= config.quantityGrids) {
        this.logger.log(
          `[Tradeflow não acessado. Limite de ordens alcançadas][${tradeflow.strategy.user.name} - ${tradeflow.strategy.user.email}]`,
        );
        return;
      }

      this.logger.log(
        `[Iniciando TradeFlow][${tradeflow.strategy.user.name} - ${tradeflow.strategy.user.email}]`,
      );

      if (ordersOpen.length < config.quantityGrids) {
        const availableOrders = config.quantityGrids - ordersOpen.length;
        let priceBuy = await this.binanceApiService.getPriceMarket(asset);
        const convertQuantity = (config.valueOrder / priceBuy).toFixed(2);

        const createOrderExchangeRequest: CreateOrderExchangeRequest = {
          apiKey: tradeflow.strategy.user.credential!.apiKey,
          secretKey: tradeflow.strategy.user.credential!.secretKey,
          symbol: asset,
          typeOrder: 'LIMIT',
          side: '',
          quantity: convertQuantity.toString(),
          price: priceBuy,
          target: '',
        };

        for (let i = 1; i <= availableOrders; i++) {
          const priceSell = priceBuy * (1 + profitTarget / 100);

          createOrderExchangeRequest.price = Number(priceBuy).toFixed(2);
          createOrderExchangeRequest.side = 'BUY';
          createOrderExchangeRequest.target = Number(priceSell).toFixed(2);
          await this.createOrder(createOrderExchangeRequest, tradeflow);

          priceBuy *= 1 - variableOrder / 100;

          this.logger.log(
            `[Enviando ordem de compra][${tradeflow.strategy.user.name} - ${tradeflow.strategy.user.email}]`,
          );
        }
      }
    });
  }

  /**
   * Cria uma ordem de compra e uma ordem de venda correspondente no banco de dados.
   *
   * @param createOrderExchangeRequest - Dados da ordem para enviar à exchange.
   * @param tradeflow - Fluxo de trade associado à ordem.
   *
   * Este método envia uma ordem para a exchange e registra a
   * transação no banco de dados. Ele cria uma ordem de compra
   * e, em seguida, uma ordem de venda correspondente, vinculando
   * as duas como um par. Atualiza o banco de dados com as informações
   * da ordem de compra e venda e associa os IDs das ordens.
   */

  async createOrder(
    createOrderExchangeRequest: CreateOrderExchangeRequest,
    tradeflow: any,
  ) {
    const sendOrder = await this.sendExchangeOrder(createOrderExchangeRequest);
    this.logger.log(
      `Enviando ordem para exchange: ${JSON.stringify(sendOrder)}`,
    );
    const createOrderDatabaseDto: CreateOrderDatabaseDto = {
      assetId: tradeflow.assetId,
      userId: tradeflow.strategy.user.id,
      strategyId: tradeflow.strategy.id,
      quantity: createOrderExchangeRequest.quantity,
      openDate: new Date(),
      openPrice: createOrderExchangeRequest.price,
      typeOrder: createOrderExchangeRequest.typeOrder,
      targetPrice: createOrderExchangeRequest.target,
      side: createOrderExchangeRequest.side,
      status: 'PENDENTE',
      isActive: true,
      idOrderExchange: sendOrder.orderId?.toString() ?? '',
    };

    const createBuyOrder = await this.orderService.createOnDatabase(
      createOrderDatabaseDto,
    );

    createOrderDatabaseDto.targetPrice = createOrderExchangeRequest.target;
    createOrderDatabaseDto.side = 'SELL';
    createOrderDatabaseDto.pairOrderId = createBuyOrder.id;
    createOrderDatabaseDto.idOrderExchange = '';

    const createSellOrder = await this.orderService.createOnDatabase(
      createOrderDatabaseDto,
    );
    await this.orderService.updateIdPairOrder(
      createBuyOrder.id,
      createSellOrder.id,
    );
    this.logger.log(
      `Processo de ativação de automação concluido: ${tradeflow.strategy.user.name} - ${tradeflow.strategy.user.email}`,
    );
  }

  /**
   * Envia uma ordem para a Binance
   *
   * @param createOrderExchangeRequest dados da ordem a ser enviada
   * @returns dados da ordem enviada
   * @throws BadRequestException se o tipo de ordem for invalido
   * @throws InternalServerErrorException se houver erro ao enviar ordem
   */

  async sendExchangeOrder(
    createOrderExchangeRequest: CreateOrderExchangeRequest,
  ) {
    const newOrder = (await this.binanceApiService.newOrder({
      apiKey: createOrderExchangeRequest.apiKey,
      apiSecret: createOrderExchangeRequest.secretKey,
      symbol: createOrderExchangeRequest.symbol,
      side: createOrderExchangeRequest.side,
      typeOrder: createOrderExchangeRequest.typeOrder,
      price: createOrderExchangeRequest.price,
      quantity: createOrderExchangeRequest.quantity,
    })) as NewOrder;

    return newOrder;
  }

  /**
   * Retorna todos os fluxos de trade ativos.
   *
   * @returns lista de fluxos de trade ativos
   */
  async getActivesTradeflow() {
    const activesTradeflow = await this.prisma.tradeflow.findMany({
      where: {
        isActive: true,
      },
      include: {
        asset: true,
        strategy: {
          include: {
            user: {
              include: {
                credential: true,
              },
            },
          },
        },
      },
    });
    return activesTradeflow;
  }

  /**
   * Retorna as ordens de venda pendentes.
   *
   * @returns lista de ordens de venda pendentes.
   */
  async getOpenOrders() {
    return await this.prisma.order.findMany({
      where: {
        status: 'PENDENTE',
        side: 'SELL',
      },
    });
  }

  /**
   * Verifica se as ordens pendentes foram executadas.
   *
   * Verifica se as ordens de compra pendentes foram executadas e,
   * se sim, fecha a ordem e envia uma ordem de venda com o preco de venda
   * estabelecido na ordem de compra.
   */
  @Interval(20000)
  async checkOrders() {
    if (this.configService.get('NODE_ENV') === 'test') {
      return;
    }
    const orders = await this.orderService.getPendingOrdersCreated();

    this.logger.log(`Checando ordens pendentes: ${orders.length}`);

    if (orders.length > 0) {
      for (const order of orders) {
        const check: CheckOrder = {
          apiKey: order.user?.credential?.apiKey ?? '',
          apiSecret: order.user?.credential?.secretKey ?? '',
          symbol: order.asset.symbol,
          orderId: order.idOrderExchange,
        };

        const checkOrder = await this.binanceApiService.checkOrder(check);

        if (checkOrder && checkOrder.status === 'FILLED') {
          this.logger.log(`Ordem executada: ${JSON.stringify(checkOrder)}`, '');
          const updateOrder: UpdateOrderDto = {
            status: 'EXECUTADA',
            closeDate: new Date(),
            closePrice: Number(checkOrder.price).toFixed(2),
          };

          if (order.side == 'SELL') {
            this.logger.warn("ORDER SELL FILLED" , order.id);
            const priceBuy = order.pairOrder?.closePrice;
            const priceSell = order.closePrice;
            const quantity = order.quantity;


            this.logger.warn("PRICEBUY, PRICESELL, QUANTITY" , priceBuy, priceSell, quantity);
            

            if (priceBuy && priceSell && quantity) {
              const totalBuy = Number(priceBuy) * Number(quantity);
              const totalSell = Number(priceSell) * Number(quantity);
              const profit = totalSell - totalBuy;
              const performance = (profit / totalBuy) * 100;
              updateOrder.result = String(profit.toFixed(2));
              updateOrder.strategyId = order.strategyId!;
              updateOrder.performance = String(performance.toFixed(2)); 

              this.logger.warn("PRICEORDERUPDATESELL" , updateOrder);
            } else {
              this.logger.warn(
                'Dados insuficiente para calcular o profit da operação',
              );
            }
          }

          await this.orderService.updateOrderFromCheckExchange(
            order.id,
            updateOrder,
          );

          if (order.side == 'BUY') {
            const createOrderExchangeRequest: CreateOrderExchangeRequest = {
              apiKey: order.user?.credential?.apiKey ?? '',
              secretKey: order.user?.credential?.secretKey ?? '',
              symbol: order.asset.symbol,
              side: 'SELL',
              typeOrder: order.typeOrder,
              price: order.targetPrice!,
              quantity: order.quantity,
              target: order.targetPrice!,
            };

            const sendSellOrder = await this.sendExchangeOrder(
              createOrderExchangeRequest,
            );

            if (sendSellOrder) {
              const updateOrder: UpdateOrderDto = {
                idOrderExchange: sendSellOrder.orderId?.toString(),
              };

              await this.orderService.updateOrderFromCheckExchange(
                order.pairOrder!.id,
                updateOrder,
              );
            }
          }
        }
      }
    }

    this.startEngineTharseo();
  }
}
