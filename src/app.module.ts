import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [UserModule, DatabaseModule, HealthModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
