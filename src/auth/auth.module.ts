import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthGuard } from './auth.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserModule)],
  providers: [AuthService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
