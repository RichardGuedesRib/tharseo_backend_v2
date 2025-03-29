import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { BinanceapiService } from 'src/binance/binanceapi/binanceapi.service';
import NewOrder from 'src/binance/dto/orders/new.order';
import { CreateOrderExchangeRequest } from './dto/create-order-exchange-request';
import { OrderService } from 'src/order/order.service';
import { CreateOrderDatabaseDto } from 'src/order/dto/create-order-database.dto';

@Injectable()
export class EngineTharseoService {
  private prisma: PrismaService;
  private readonly logger = new Logger(EngineTharseoService.name);
  private readonly binanceApiService: BinanceapiService;
  private readonly orderService: OrderService;

  constructor(prisma: PrismaService, binanceApiService: BinanceapiService, orderService: OrderService) {
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
          let priceSell = priceBuy * (1 + profitTarget / 100);

          createOrderExchangeRequest.price = Number(priceBuy).toFixed(2);
          createOrderExchangeRequest.side = 'BUY';
          createOrderExchangeRequest.target = Number(priceSell).toFixed(2);
          await this.createOrder(
            createOrderExchangeRequest,
            tradeflow,
          );

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
    this.logger.log(`Enviando ordem para exchange: ${JSON.stringify(sendOrder)}`);
    const createOrderDatabaseDto : CreateOrderDatabaseDto = {
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
      idOrderExchange:sendOrder.orderId?.toString() ?? '', 
    } 

    const createBuyOrder = await this.orderService.createOnDatabase(createOrderDatabaseDto);

    createOrderDatabaseDto.targetPrice = createOrderExchangeRequest.target;
    createOrderDatabaseDto.side = 'SELL';
    createOrderDatabaseDto.pairOrderId = createBuyOrder.id;
    createOrderDatabaseDto.idOrderExchange = '';

    const createSellOrder = await this.orderService.createOnDatabase(createOrderDatabaseDto); 
    await this.orderService.updateIdPairOrder(createBuyOrder.id, createSellOrder.id); 
    this.logger.log(`Processo de ativação de automação concluido: ${tradeflow.strategy.user.name} - ${tradeflow.strategy.user.email}`); 
    
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
        side: 'SELL'
      },
    });
  }

}
