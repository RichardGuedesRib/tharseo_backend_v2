import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  /**
   * Cria um novo pedido.
   *
   * @param createOrderDto dados do pedido a ser criado.
   * @param user informa es do usu rio autenticado.
   * @returns dados do pedido criado.
   * @throws NotFoundException caso n o seja encontrado o usu rio logado.
   * @throws BadGatewayException caso ocorra um erro ao criar o pedido.
   */
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const user = req.user;
    return await this.orderService.create(createOrderDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  /**
   * Retorna todos os pedidos de um usu rio.
   *
   * @param user informa es do usu rio autenticado.
   * @returns uma lista com todos os pedidos do usu rio.
   * @throws BadGatewayException caso ocorra um erro ao buscar os pedidos.
   */
  async findAll(@Request() req) {
    const user = req.user;
    return await this.orderService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  /**
   * Retorna um pedido com base no id informado.
   *
   * @param id id do pedido a ser retornado
   * @param user informa es do usu rio autenticado
   * @returns um registro de pedido com os dados do pedido solicitado, caso exista
   * @throws NotFoundException caso o pedido n o seja encontrado
   */
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return await this.orderService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  /**
   * Atualiza um pedido com base no id informado.
   *
   * @param id id do pedido a ser atualizado
   * @param updateOrderDto dados do pedido a ser atualizado
   * @param user informa es do usu rio autenticado
   * @returns dados do pedido atualizado
   * @throws NotFoundException caso o pedido n o seja encontrado
   * @throws BadGatewayException caso ocorra um erro ao atualizar o pedido
   */
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @Request() req) {
    const user = req.user;
    return await this.orderService.update(id, updateOrderDto, user);
  }

}
