import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { TradeflowService } from './tradeflow.service';
import { CreateTradeflowDto } from './dto/create-tradeflow.dto';
import { UpdateTradeflowDto } from './dto/update-tradeflow.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('/v1/tradeflow')
export class TradeflowController {
  constructor(private readonly tradeflowService: TradeflowService) {}

  @Post()
  @UseGuards(AuthGuard)
  /**
   * Cria um novo fluxo de neg cio.
   *
   * @param createTradeflowDto dados do fluxo de neg cio a ser criado.
   * @param user informa es do usu rio autenticado.
   * @returns dados do fluxo de neg cio criado.
   * @throws NotFoundException caso a estrat gia ou o ativo n o sejam encontrados.
   * @throws BadGatewayException caso ocorra um erro ao criar o fluxo de neg cio.
   */
  async create(@Body() createTradeflowDto: CreateTradeflowDto, @Request() req) {
    const user = req.user;
    return await this.tradeflowService.create(createTradeflowDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  /**
   * Retorna todos os fluxos de neg cio de um usu rio.
   *
   * @param user informa es do usu rio autenticado.
   * @returns uma lista com todos os fluxos de neg cio do usu rio.
   * @throws BadGatewayException caso ocorra um erro ao buscar os fluxos de neg cio.
   */
  async findAll(@Request() req) {
    const user = req.user;
    return await this.tradeflowService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  /**
   * Retorna um fluxo de neg cio com base no id informado.
   *
   * @param id id do fluxo de neg cio a ser retornado
   * @param user informa es do usu rio autenticado
   * @returns um registro de fluxo de neg cio com os dados do fluxo de neg cio solicitado, caso exista
   * @throws NotFoundException caso o fluxo de neg cio nao seja encontrado
   */
  async findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    const tradeflow = await this.tradeflowService.findOne(id, user);
  
    if (!tradeflow) {
      throw new NotFoundException('Tradeflow não encontrado');
    }
  
    return tradeflow;
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  /**
   * Atualiza um fluxo de negócio existente com base no id informado.
   *
   * @param id id do fluxo de negócio a ser atualizado.
   * @param updateTradeflowDto dados do fluxo de negócio a serem atualizados.
   * @param req informações sobre o usuário autenticado.
   * @returns dados do fluxo de negócio atualizado.
   * @throws NotFoundException caso o fluxo de negócio não seja encontrado.
   * @throws UnauthorizedException caso o usuário não esteja autorizado a atualizar o fluxo de negócio.
   */
  async update(
    @Param('id') id: string,
    @Body() updateTradeflowDto: UpdateTradeflowDto,
    @Request() req,
  ) {
    const user = req.user;
    return await this.tradeflowService.update(id, updateTradeflowDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  /**
   * Remove um fluxo de neg cio com base no id informado.
   *
   * @param id id do fluxo de neg cio a ser removido
   * @param req informa es sobre o usu rio autenticado
   * @returns dados do fluxo de neg cio removido
   * @throws NotFoundException caso o fluxo de neg cio n o seja encontrado
   * @throws UnauthorizedException caso o usu rio n o esteja autorizado a remover o fluxo de neg cio
   */
  async remove(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return await this.tradeflowService.remove(id, user);
  }
}
