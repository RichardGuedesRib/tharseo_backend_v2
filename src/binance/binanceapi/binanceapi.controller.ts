import { Controller, Get, Inject } from '@nestjs/common';
import { BinanceapiService } from './binanceapi.service';

@Controller('binanceapi')
export class BinanceapiController {
  @Inject()
  private readonly binanceapiService: BinanceapiService;

  private readonly apiKey = process.env.BINANCE_API_KEY;
  private readonly apiSecret = process.env.BINANCE_API_SECRET;

  @Get('check')
  /**
   * Verifica se a conex o com a API da Binance est  OK.
   *
   * @returns um objeto com a chave "status" e valor "OK" se a conex o estiver OK.
   */
  async check() {
    return this.binanceapiService.checkConnection();
  }
}
