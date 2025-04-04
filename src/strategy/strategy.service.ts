import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyDto } from './dto/update-strategy.dto';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class StrategyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  /**
   * Cria uma nova estrat gia de um usu rio.
   *
   * @param createStrategyDto Dados da estrat gia a ser criada.
   * @param user Informa es do usu rio que est  solicitando a criacao da estrat gia.
   * @returns Um objeto com os dados da estrat gia criada.
   * @throws NotFoundException Caso o usu rio n o seja encontrado.
   * @throws BadGatewayException Caso ocorra um erro ao criar a estrat gia.
   */
  async create(createStrategyDto: CreateStrategyDto, user: TokenPayload) {
    try {
      const getUser = await this.userService.getUserById(user.userId);
      if (!getUser) {
        throw new NotFoundException('User not found');
      }

      createStrategyDto.userId = user.userId;

      const strategy = await this.prisma.strategy.create({
        data: createStrategyDto,
      });
      return strategy;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error while create strategy: ' + error,
      );
    }
  }

  /**
   * Retorna todas as estrat gias de um usu rio.
   *
   * @param user Informa es do usu rio que est  solicitando a lista de estrat gias.
   * @returns Uma lista com todas as estrat gias do usu rio.
   * @throws NotFoundException Caso o usu rio n o seja encontrado.
   * @throws BadGatewayException Caso ocorra um erro ao buscar as estrat gias.
   */
  async findAll(user: TokenPayload) {
    try {
      const getUser = await this.userService.getUserById(user.userId);
      if (!getUser) {
        throw new NotFoundException('User not found');
      }
      const strategies = await this.prisma.strategy.findMany({
        where: { userId: user.userId },
      });
      return strategies;
    } catch (error) {
      throw new BadGatewayException('Erro ao buscar estrategias');
    }
  }

  /**
   * Retorna uma estrat gia com base no id informado.
   *
   * @param id id da estrat gia a ser retornada
   * @param user informa es do usu rio que est  solicitando a estrat gia
   * @returns um objeto com os dados da estrat gia solicitada, caso exista
   * @throws NotFoundException caso a estrat gia nao seja encontrada
   * @throws BadGatewayException caso ocorra um erro ao buscar a estrat gia
   */
  async findOne(id: string, user: TokenPayload) {
    const getUser = await this.userService.getUserById(user.userId);
    if (!getUser) {
      throw new NotFoundException('User not found');
    }
    const strategy = await this.prisma.strategy.findUnique({
      where: { id: id },
    });

    if (!strategy) {
      throw new NotFoundException('Strategy not found');
    }
    if (strategy && strategy.userId !== user.userId) {
      throw new UnauthorizedException('Unauthorized for this user');
    }
    return strategy;
  }

  /**
   * Atualiza uma estratégia com base no id informado.
   *
   * @param id id da estratégia a ser atualizada
   * @param updateStrategyDto dados da estratégia a serem atualizados
   * @returns um objeto com os dados da estratégia atualizada
   * @throws NotFoundException caso a estratégia não seja encontrada
   * @throws InternalServerErrorException caso ocorra um erro ao atualizar a estratégia
   */

  async update(
    id: string,
    updateStrategyDto: UpdateStrategyDto,
    user: TokenPayload,
  ) {
    const strategy = await this.prisma.strategy.findUnique({
      where: { id: id },
    });
    if (!strategy) {
      throw new NotFoundException('Strategy not found');
    }

    if (strategy && strategy.userId !== user.userId) {
      throw new UnauthorizedException('Unauthorized for this user');
    }
    const updateStrategy = await this.prisma.strategy.update({
      where: { id: id },
      data: updateStrategyDto,
    });
    return updateStrategy;
  }

  remove(id: number) {
    return `This action removes a #${id} strategy`;
  }
}
