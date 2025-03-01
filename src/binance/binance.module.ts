import { Module } from '@nestjs/common';
import { SignatureService } from 'src/binance/signature/signature.service'; 
import { BinanceapiController } from './binanceapi/binanceapi.controller';
import { BinanceapiService } from './binanceapi/binanceapi.service';

@Module({
  providers: [BinanceapiService],
  exports: [BinanceapiService],
  controllers: [BinanceapiController],
})
export class BinanceModule {}
