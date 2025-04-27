import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { AuthGuard } from './auth.guard';
import { UserModule } from '../user/user.module';
import { AdminGuard } from './guards/admin/admin.guard';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserModule), MetricsModule],
  providers: [AuthService, AuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, AdminGuard],
})
export class AuthModule {}
