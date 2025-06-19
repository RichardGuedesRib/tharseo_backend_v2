import { Module } from '@nestjs/common';
import { EngineTharseoService } from './engine-tharseo.service';
import { DatabaseModule } from '../database/database.module';
import { EngineTharseoController } from './engine-tharseo.controller';
import { BinanceModule } from '../binance/binance.module';
import { OrderModule } from '../order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    BinanceModule,
    OrderModule,
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  providers: [EngineTharseoService],
  exports: [EngineTharseoService],
  controllers: [EngineTharseoController],
})
export class EngineTharseoModule {}
