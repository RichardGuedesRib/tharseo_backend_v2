import { CreateTradeflowDto } from './dto/create-tradeflow.dto';
import { UpdateTradeflowDto } from './dto/update-tradeflow.dto';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { PrismaService } from 'src/database/prisma.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { StrategyService } from 'src/strategy/strategy.service';
import { AssetService } from 'src/asset/asset.service';
import { EngineTharseoService } from 'src/engine-tharseo/engine-tharseo.service';

@Injectable()
export class TradeflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly strategyService: StrategyService,
    private readonly assetService: AssetService,
    private readonly engineTharseoService: EngineTharseoService,
  ) {}

  /**
   * Cria um novo fluxo de neg cio.
   *
   * @param createTradeflowDto dados do fluxo de neg cio a ser criado.
   * @param user informa es do usu rio autenticado.
   * @returns dados do fluxo de neg cio criado.
   * @throws NotFoundException caso a estrat gia ou o ativo n o sejam encontrados.
   * @throws BadGatewayException caso ocorra um erro ao criar o fluxo de neg cio.
   */
  async create(createTradeflowDto: CreateTradeflowDto, user: TokenPayload) {
    const strategy = await this.strategyService.findOne(
      createTradeflowDto.strategyId,
      user,
    );
    if (!strategy) {
      throw new NotFoundException('Strategy not found');
    }

    const asset = await this.assetService.findOne(createTradeflowDto.assetId);
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const newTradeFlow = await this.prisma.tradeflow.create({
      data: createTradeflowDto,
    });

    return newTradeFlow;
  }

  /**
   * Retorna todos os fluxos de neg cio de um usu rio.
   *
   * @param user informa es do usu rio autenticado.
   * @returns uma lista com todos os fluxos de neg cio do usu rio.
   * @throws NotFoundException caso n o seja encontrado nenhum fluxo de neg cio.
   */

  async findAll(user: TokenPayload) {
    const tradesFlow = await this.prisma.tradeflow.findMany({
      where: {
        strategy: {
          userId: user.userId,
        },
      },
      include: {
        strategy: true,
        asset: true,
      },
    });
    return tradesFlow;
  }

  /**
   * Retorna um fluxo de neg cio com base no id informado.
   *
   * @param id id do fluxo de neg cio a ser retornado.
   * @param user informa es do usu rio autenticado.
   * @returns um objeto com os dados do fluxo de neg cio solicitado, caso exista.
   * @throws NotFoundException caso o fluxo de neg cio n o seja encontrado.
   */
  async findOne(id: string, user: TokenPayload) {
    const tradeFlow = await this.prisma.tradeflow.findUnique({
      where: {
        id: id,
        strategy: {
          userId: user.userId,
        },
      },
      include: {
        strategy: true,
        asset: true,
      },
    });

    if (!tradeFlow) {
      throw new NotFoundException('TradeFlow not found');
    }
    return tradeFlow;
  }

  /**
   * Atualiza um fluxo de negócio existente.
   *
   * @param id id do fluxo de negócio a ser atualizado.
   * @param updateTradeflowDto dados do fluxo de negócio a serem atualizados.
   * @param user informações do usuário autenticado.
   * @returns dados do fluxo de negócio atualizado.
   * @throws NotFoundException caso o fluxo de negócio não seja encontrado.
   * @throws UnauthorizedException caso o usuário não esteja autorizado a atualizar o fluxo de negócio.
   */

  async update(
    id: string,
    updateTradeflowDto: UpdateTradeflowDto,
    user: TokenPayload,
  ) {
    const tradeFlow = await this.prisma.tradeflow.findUnique({
      where: { id: id },
      include: { strategy: true },
    });

    if (!tradeFlow) {
      throw new NotFoundException('TradeFlow not found');
    }

    if (tradeFlow.strategy.userId !== user.userId) {
      throw new UnauthorizedException('User not authorized');
    }

    if(tradeFlow.isActive){
      this.engineTharseoService.startEngineTharseo();
    }

  

    const updateTradeFlow = await this.prisma.tradeflow.update({
      where: { id: id },
      data: updateTradeflowDto,
    });
    return updateTradeFlow;
  }

  /**
   * Remove um fluxo de negócio da base de dados com base no id informado.
   *
   * @param id id do fluxo de negócio a ser removido.
   * @param user informações do usuário autenticado.
   * @returns dados do fluxo de negócio removido.
   * @throws NotFoundException caso o fluxo de negócio não seja encontrado.
   * @throws UnauthorizedException caso o usuário não esteja autorizado a remover o fluxo de negócio.
   */

  async remove(id: string, user: TokenPayload) {
    const tradeFlow = await this.prisma.tradeflow.findUnique({
      where: { id: id },
      include: { strategy: true },
    });

    if (!tradeFlow) {
      throw new NotFoundException('TradeFlow not found');
    }

    if (tradeFlow.strategy.userId !== user.userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const deleteTradeFlow = await this.prisma.tradeflow.delete({
      where: { id: id },
    });
    return deleteTradeFlow;
  }
}


