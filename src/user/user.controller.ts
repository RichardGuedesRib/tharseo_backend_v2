import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

// Teste de deploy

@Controller('user')
export class UserController {
  @Inject()
  private readonly userService: UserService;

  @UseGuards(AuthGuard)
  @Get('/')
  /**
   * Retorna todos os usu rios cadastrados.
   *
   * @returns Uma lista com todos os usu rios cadastrados.
   */
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
