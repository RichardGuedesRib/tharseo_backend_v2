import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { EngineTharseoService } from './engine-tharseo.service';

@Controller('/v1/engine-tharseo')
export class EngineTharseoController {
  constructor(private readonly engineTharseoService: EngineTharseoService) {}

  @Get('start')
  @UseGuards(AuthGuard)

  /**
   * Inicia o motor da estrat gia Tharseo.
   *
   * Esta fun o  respons vel por iniciar o motor da estrat gia Tharseo.
   * Ela recupera todas as Tradeflows ativas e, para cada uma delas,
   * verifica se o n mero de ordens abertas   menor que o limite
   * estabelecido na configura o da estrat gia. Caso sim, envia
   * novas ordens de compra com o valor estabelecido na configura o
   * e com o pre o de compra calculado com base no pre o de mercado
   * atual e na vari vel de ordem. Al m disso, calcula o pre o de venda
   * com base no pre o de compra e no lucro alvo estabelecido na
   * configura o.
   *
   * @returns nothing
   */
  async startEngine() {
    return await this.engineTharseoService.startEngineTharseo();
  }

  @Get('check')
  @UseGuards(AuthGuard)
  /**
   * Verifica se as ordens abertas est o executadas.
   *
   * Esta fun o verifica se as ordens abertas est o executadas e atualiza o
   * status delas no banco de dados.
   * 
   * @returns nothing
   */
  async checkOrders() {
    return await this.engineTharseoService.checkOrders();
  }
}
