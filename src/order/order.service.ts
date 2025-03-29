import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderDatabaseDto } from './dto/create-order-database.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserService } from 'src/user/user.service';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/database/prisma.service';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { BinanceapiService } from 'src/binance/binanceapi/binanceapi.service';
import NewOrder from 'src/binance/dto/orders/new.order';
import { Logger } from '@nestjs/common';


@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly assetService: AssetService,
    private readonly binanceApiService: BinanceapiService,
    
  ) {}

  /**
   * Cria um novo pedido.
   *
   * @param createOrderDto dados do pedido a ser criado.
   * @param user informa es do usu rio autenticado.
   * @returns dados do pedido criado.
   * @throws NotFoundException caso a estrat gia, o ativo ou o usu rio n o sejam encontrados.
   */
  async create(createOrderDto: CreateOrderDto, user: TokenPayload) {
    this.logger.log(`Pedido de ordem recebido: ${JSON.stringify(createOrderDto)}, ${user}`);

    const asset = await this.assetService.findOne(createOrderDto.assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const userReq = await this.userService.getUserById(user.userId);
    if (!userReq) {
      throw new NotFoundException('User not found');
    }

    const createOrderBinance : NewOrder = {
      apiKey: userReq.credential?.apiKey!,
      apiSecret: userReq.credential?.secretKey!,
      symbol: asset.symbol,
      side: createOrderDto.side,
      typeOrder: createOrderDto.typeOrder,
      price: createOrderDto.typeOrder == "LIMIT" ? createOrderDto.targetPrice.toString() : null,
      quantity: createOrderDto.quantity,    
    }

    const sendOrderExchange = await this.binanceApiService.newOrder(createOrderBinance);

    if(sendOrderExchange && sendOrderExchange.status == "FILLED"){
      const createOrder = await this.prisma.order.create({
        data: {
          asset: {
            connect: {
              id: createOrderDto.assetId,
            },
          },
          user: {
            connect: {
              id: userReq.id,
            }
          },
          openDate: new Date(),
          closeDate: new Date(),
          openPrice: sendOrderExchange.fills?.[0]?.price ? sendOrderExchange.fills?.[0]?.price : null,
          closePrice: sendOrderExchange.fills?.[0]?.price ? sendOrderExchange.fills?.[0]?.price : null,
          quantity: sendOrderExchange.executedQty,
          side: createOrderDto.side,
          status: "EXECUTADA",
          typeOrder: createOrderDto.typeOrder,
          targetPrice: createOrderBinance.price ? createOrderBinance.price : null,
          isActive: true,
        },
      });

      this.logger.log(`Pedido de ordem executado: ${JSON.stringify(createOrder)}, ${user}`);
      return createOrder;
    } else {
      throw new ServiceUnavailableException('Order not created');
    }

    
  }


  /**
   * Salva um pedido no banco de dados.
   *
   * @param createOrderDatabaseDto dados do pedido a ser salvo
   * @returns dados do pedido salvo
   * @throws NotFoundException caso n o seja encontrado o usu rio logado
   * @throws BadGatewayException caso ocorra um erro ao salvar o pedido
   */
  async createOnDatabase(createOrderDatabaseDto: CreateOrderDatabaseDto) {
    this.logger.log(`Pedido de cadastro de ordem recebido: ${JSON.stringify(createOrderDatabaseDto)}`);

    const asset = await this.assetService.findOne(createOrderDatabaseDto.assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const userReq = await this.userService.getUserById(createOrderDatabaseDto.userId);
    if (!userReq) {
      throw new NotFoundException('User not found');
    }
    
      const createOrder = await this.prisma.order.create({
        data: {
          asset: {
            connect: {
              id: createOrderDatabaseDto.assetId,
            },
          },
          user: {
            connect: {
              id: userReq.id,
            }
          },
          pairOrder: createOrderDatabaseDto.pairOrderId ? {
            connect: {
              id: createOrderDatabaseDto.pairOrderId,
            }
          }  : undefined,
          strategy: {
            connect: {
              id: createOrderDatabaseDto.strategyId,
            }
          },
          openDate: new Date(),
          openPrice: createOrderDatabaseDto.openPrice,
          closePrice: createOrderDatabaseDto.closePrice ?? null,
          quantity: createOrderDatabaseDto.quantity,
          side: createOrderDatabaseDto.side,
          status: createOrderDatabaseDto.status,
          typeOrder: createOrderDatabaseDto.typeOrder,
          targetPrice: createOrderDatabaseDto.targetPrice,
          isActive: createOrderDatabaseDto.isActive,
          idOrderExchange: createOrderDatabaseDto.idOrderExchange,
        },
      });

      this.logger.log(`Pedido de ordem salvo no banco de dados: ${JSON.stringify(createOrder)}`);
      return createOrder;
      
  }

  /**
   * Retorna todos os pedidos de um usu rio.
   *
   * @param user informa es do usu rio autenticado.
   * @returns lista de pedidos do usu rio.
   */
  async findAll(user: TokenPayload) {
    const orders = await this.prisma.order.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        strategy: true,
        asset: true,
      },
      orderBy: {
        openDate: 'desc',
      },
    });

    return orders;
  }

  /**
   * Retorna um pedido com base no id informado.
   *
   * @param id id do pedido a ser retornado.
   * @param user informa es do usu rio autenticado.
   * @returns um objeto com os dados do pedido solicitado, caso exista.
   * @throws NotFoundException caso o pedido n o seja encontrado.
   */
  async findOne(id: string, user: TokenPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id: id, userId: user.userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  /**
   * Atualiza um pedido com base no id informado.
   *
   * @param id id do pedido a ser atualizado.
   * @param updateOrderDto dados do pedido a serem atualizados.
   * @param user informa es do usu rio autenticado.
   * @returns um objeto com os dados do pedido atualizado.
   * @throws NotFoundException caso o pedido n o seja encontrado.
   */
  async update(id: string, updateOrderDto: UpdateOrderDto, user: TokenPayload) {
    const order = await this.prisma.order.findFirst({
      where: { id: id, userId: user.userId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    const updateOrder = await this.prisma.order.update({
      where: { id: id },
      data: updateOrderDto,
    });

    return updateOrder;
  }

  /**
   * Atualiza o campo pairOrderId do pedido informado.
   *
   * @param id id do pedido a ser atualizado.
   * @param idPairOrder id do pedido de par que ser  atualizado.
   */
  async updateIdPairOrder(id:string, idPairOrder: string) {
    await this.prisma.order.update({
      where: { id: id },
      data: {
        pairOrder: {
          connect: {
            id: idPairOrder
          }
        }
      }
    })    
  }

  /**
   * Retorna todos os pedidos com status PENDENTE que n o t m um id de pedido na exchange.
   *
   * @returns lista de pedidos pendentes sem id de pedido na exchange.
   */
  async getPendingOrdersCreated() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'PENDENTE',
        OR: [
          { idOrderExchange: null }, 
          { idOrderExchange: '' }, 
        ],
      },
    });
  
    return orders;
  }
}
