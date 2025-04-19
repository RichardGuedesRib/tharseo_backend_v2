import {
  Controller,
  Post,
  Inject,
  Body,
  HttpException,
  HttpCode,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginRequest } from './dtos/login.request';

@Controller('auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  /**
   * Cria um novo usuario com os dados fornecidos no corpo da requisi o.
   * Retorna o usu rio criado.
   * @param data Dados do usu rio a ser criado.
   */
  @Post('signup')
  async signUp(@Body() data: Prisma.UserCreateInput) {
    const user = await this.authService.signUp(data);
    return user;
  }

  /**
   * Faz login com o email e senha fornecidos no corpo da requisi o,
   * retornando o usu rio autenticado.
   * @param data Email e senha do usu rio.
   */
  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() data: LoginRequest) {
    const auth = await this.authService.signIn(data);
    return auth;
  }
}
