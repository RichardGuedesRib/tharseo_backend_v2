import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { BinanceModule } from './binance/binance.module';
import { WalletModule } from './wallet/wallet.module';
import { AssetModule } from './asset/asset.module';
import { StrategyModule } from './strategy/strategy.module';
import { TradeflowModule } from './tradeflow/tradeflow.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    HealthModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1200s' },
    }),
    BinanceModule,
    WalletModule,
    AssetModule,
    StrategyModule,
    TradeflowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
