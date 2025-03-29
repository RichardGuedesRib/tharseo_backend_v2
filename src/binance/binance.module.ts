import { Module } from '@nestjs/common';
import { SignatureService } from 'src/binance/signature/signature.service'; 
import { BinanceapiController } from './binanceapi/binanceapi.controller';
import { BinanceapiService } from './binanceapi/binanceapi.service';
import { BinanceWsService } from './binanceapi/binancews.service';

@Module({
  providers: [BinanceapiService, BinanceWsService],
  controllers: [BinanceapiController],
  exports: [BinanceapiService, BinanceWsService],
})
export class BinanceModule {}
