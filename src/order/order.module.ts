import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { DatabaseModule } from '../database/database.module';
import { forwardRef } from '@nestjs/common/utils';
import { AssetModule } from 'src/asset/asset.module';
import { UserModule } from 'src/user/user.module';
import { StrategyModule } from 'src/strategy/strategy.module';
import { BinanceModule } from 'src/binance/binance.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    forwardRef(() => AssetModule),
    forwardRef(() => StrategyModule),
    BinanceModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
