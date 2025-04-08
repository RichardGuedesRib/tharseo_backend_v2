import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UserModule } from '../user/user.module';
import { DatabaseModule } from '../database/database.module';
import { forwardRef } from '@nestjs/common/utils';
import { AssetModule } from '../asset/asset.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UserModule,
    DatabaseModule,
    forwardRef(() => AssetModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
