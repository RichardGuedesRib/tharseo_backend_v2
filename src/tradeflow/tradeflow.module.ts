import { Module } from '@nestjs/common';
import { TradeflowService } from './tradeflow.service';
import { TradeflowController } from './tradeflow.controller';
import { DatabaseModule } from '../database/database.module';
import { forwardRef } from '@nestjs/common/utils';
import { AssetModule } from '../asset/asset.module';
import { UserModule } from '../user/user.module';
import { StrategyModule } from '../strategy/strategy.module';
import { EngineTharseoModule } from '../engine-tharseo/engine-tharseo.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    forwardRef(() => AssetModule),
    forwardRef(() => StrategyModule),
    EngineTharseoModule,
  ],
  controllers: [TradeflowController],
  providers: [TradeflowService],
})
export class TradeflowModule {}
