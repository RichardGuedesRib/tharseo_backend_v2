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
import { OrderModule } from './order/order.module';
import { EngineTharseoModule } from './engine-tharseo/engine-tharseo.module';
import { ConfigModule } from '@nestjs/config';
import { BinanceapiService } from './binance/binanceapi/binanceapi.service';
import { MetricsModule } from './metrics/metrics.module';

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
    OrderModule,
    EngineTharseoModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    MetricsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
