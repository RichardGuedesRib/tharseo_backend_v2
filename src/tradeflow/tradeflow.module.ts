import { Module } from '@nestjs/common';
import { TradeflowService } from './tradeflow.service';
import { TradeflowController } from './tradeflow.controller';
import {DatabaseModule} from "../database/database.module";
import { forwardRef } from '@nestjs/common/utils';
import { AssetModule } from 'src/asset/asset.module';
import { UserModule } from 'src/user/user.module';
import { StrategyModule } from 'src/strategy/strategy.module';
import { EngineTharseoModule } from 'src/engine-tharseo/engine-tharseo.module';

@Module({
  imports: [UserModule, DatabaseModule, forwardRef(() => AssetModule),  forwardRef(() => StrategyModule), EngineTharseoModule], 
  controllers: [TradeflowController],
  providers: [TradeflowService],
})
export class TradeflowModule {}
