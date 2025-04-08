import { Module } from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { StrategyController } from './strategy.controller';
import { DatabaseModule } from '../database/database.module';
import { forwardRef } from '@nestjs/common/utils';
import { AssetModule } from '../asset/asset.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    forwardRef(() => AssetModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [StrategyController],
  providers: [StrategyService],
  exports: [StrategyService],
})
export class StrategyModule {}
