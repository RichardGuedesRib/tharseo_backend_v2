import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyDto } from './dto/update-strategy.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('/v1/strategy')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Post()
  @UseGuards(AuthGuard)
  /**
   * Cria uma nova estrat gia.
   *
   * @param createStrategyDto dados da estrat gia a ser criada.
   * @param req informa es sobre o usu rio autenticado.
   * @returns dados da estrat gia criada.
   * @throws NotFoundException caso o usu rio n o seja encontrado.
   * @throws BadGatewayException caso ocorra um erro ao criar a estrat gia.
   */
  create(@Body() createStrategyDto: CreateStrategyDto, @Request() req) {    
    const user = req.user;
    return this.strategyService.create(createStrategyDto, user);
  }

  @Get()
  @UseGuards(AuthGuard)
  /**
   * Retorna todas as estrat gias de um usu rio.
   *
   * @param req informa es sobre o usu rio autenticado.
   * @returns uma lista com todas as estrat gias do usu rio.
   * @throws NotFoundException caso o usu rio n o seja encontrado.
   * @throws BadGatewayException caso ocorra um erro ao buscar as estrat gias.
   */
  findAll(@Request() req) {
    const user = req.user;
    return this.strategyService.findAll(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  /**
   * Retorna uma estrat gia com base no id informado.
   *
   * @param id id da estrat gia a ser retornada
   * @param req informa es sobre o usu rio autenticado
   * @returns um objeto com os dados da estrat gia solicitada, caso exista
   * @throws NotFoundException caso a estrat gia n o seja encontrada
   * @throws BadGatewayException caso ocorra um erro ao buscar a estrat gia
   */
  findOne(@Param('id') id: string, @Request() req) {
    const user = req.user;
    return this.strategyService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  /**
   * Atualiza uma estrat gia existente.
   *
   * @param id id da estrat gia a ser atualizada
   * @param updateStrategyDto dados da estrat gia a ser atualizados
   * @param req informa es sobre o usu rio autenticado
   * @returns dados da estrat gia atualizados
   * @throws NotFoundException caso a estrat gia n o seja encontrada
   * @throws BadGatewayException caso ocorra um erro ao atualizar a estrat gia
   */
  update(@Param('id') id: string, @Body() updateStrategyDto: UpdateStrategyDto, @Request() req) {
    const user = req.user;
    return this.strategyService.update(id, updateStrategyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.strategyService.remove(+id);
  }
}
