import { Module } from '@nestjs/common';
import { EngineTharseoService } from './engine-tharseo.service';
import { DatabaseModule } from 'src/database/database.module';
import { EngineTharseoController } from './engine-tharseo.controller';
import { BinanceModule } from 'src/binance/binance.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [DatabaseModule, BinanceModule, OrderModule],
  providers: [EngineTharseoService],
  exports: [EngineTharseoService],
  controllers: [EngineTharseoController],
})
export class EngineTharseoModule {}
