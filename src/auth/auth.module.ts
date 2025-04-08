import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { DatabaseModule } from '../database/database.module';
import { AuthGuard } from './auth.guard';
import { UserModule } from '../user/user.module';
import { AdminGuard } from './guards/admin/admin.guard';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserModule)],
  providers: [AuthService, AuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, AdminGuard],
})
export class AuthModule {}
