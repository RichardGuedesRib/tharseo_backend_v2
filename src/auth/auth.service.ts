import {
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { LoginRequest } from './dtos/login.request';
import { LoginResponse } from './dtos/login.response';
import { ChangePasswordDto } from './dtos/change-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  @Inject()
  private readonly userService: UserService;
  @Inject()
  private readonly jwtService: JwtService;

  constructor(
    @InjectMetric('auth_http_count')
    public counter: Counter<string>,
    @InjectMetric('auth_http_duration_seconds')
    private readonly authHttpDuration: Histogram<string>,
  ) {}

  /**
   * Cria um novo usuario no banco de dados
   *
   * @param data dados do usuario a ser criado
   * @returns um objeto com os dados do usuario, exceto a senha
   */

  async signUp(data: Prisma.UserCreateInput) {
    const end = this.authHttpDuration.startTimer({ method: 'signUp' });
    this.counter.inc({ method: 'signUp' });
    try {
      const hashPassword = await bcrypt.hash(data.password, 10);
      data.password = hashPassword;
      this.logger.log(`Criando usuario: ${JSON.stringify(data)}`);
      return await this.userService.createUser(data);
    } catch (error) {
      throw new BadRequestException('Erro ao cadastrar usuário', error.message);
    } finally {
      end();
    }
  }

  /**
   * Realiza o login de um usuario
   *
   * @param data dados de login
   * @returns um objeto com os dados do usuario, exceto a senha e um token JWT para autenticacao
   * @throws UnauthorizedException caso o email ou senha estejam incorretos
   */
  async signIn(data: LoginRequest): Promise<LoginResponse> {
    const end = this.authHttpDuration.startTimer({ method: 'signIn' });
    this.counter.inc({ method: 'signIn' });
    const user = await this.userService.getUserByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }
    if (!(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }
    const payload = {
      id: user.id,
      userId: user.id,
      username: user.email,
      levelUser: user.levelUser,
      isActive: user.isActive,
    };

    this.logger.log(`Login realizado: ${JSON.stringify(payload)}`);

    end();
    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        levelUser: user.levelUser,
        balance: user.balance,
        isActive: user.isActive,
      },
      token: this.jwtService.sign(payload),
      expiresIn: 11200,
    };
  }

  /**
   * Altera a senha de um usuário
   *
   * @param userId ID do usuário
   * @param data dados para alteração de senha
   * @returns confirmação da alteração
   * @throws BadRequestException caso as senhas não coincidam ou a senha atual esteja incorreta
   */
  async changePassword(userId: string, data: ChangePasswordDto) {
    const end = this.authHttpDuration.startTimer({ method: 'changePassword' });
    this.counter.inc({ method: 'changePassword' });

    try {
      if (data.newPassword !== data.confirmPassword) {
        throw new BadRequestException('Nova senha e confirmação não coincidem');
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      if (!(await bcrypt.compare(data.currentPassword, user.password))) {
        throw new BadRequestException('Senha atual incorreta');
      }

      const hashPassword = await bcrypt.hash(data.newPassword, 10);
      await this.userService.updateUserPassword(userId, hashPassword);

      this.logger.log(`Senha alterada para o usuário: ${user.email}`);

      return { message: 'Senha alterada com sucesso' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao alterar senha');
    } finally {
      end();
    }
  }
}
