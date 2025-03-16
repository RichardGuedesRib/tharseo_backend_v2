import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { StrategyService } from 'src/strategy/strategy.service';
import { UserService } from 'src/user/user.service';
import { AssetService } from 'src/asset/asset.service';
import { PrismaService } from 'src/database/prisma.service';
import { TokenPayload } from 'src/auth/dtos/token.payload';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly strategyService: StrategyService,
    private readonly assetService: AssetService,
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
    createOrderDto.userId = user.userId;

    if (createOrderDto.strategyId) {
      const strategy = await this.strategyService.findOne(
        createOrderDto.strategyId,
        user,
      );
      if (!strategy) {
        throw new NotFoundException('Strategy not found');
      }
    }

    const asset = await this.assetService.findOne(createOrderDto.assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const userReq = await this.userService.getUserById(user.userId);
    if (!userReq) {
      throw new NotFoundException('User not found');
    }

    const createOrder = await this.prisma.order.create({
      data: createOrderDto,
    });

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
}
