import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly secret = process.env.SECRET_KEY;

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Verifica se o token de autentica o  v lido e se o usu rio est  autenticado.
   * @param context ExecutionContext
   * @returns Promessa booleana indicando se o usu rio est  autenticado.
   * @throws UnauthorizedException se o token for inv lido ou ausente.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = this.extractTokenFromHeader(request);
    if (!authorization) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(authorization, {
        secret: this.secret,
      });
      request.user = payload;
    } catch (error) {
      console.error('JWT Verification Error:', error);
      throw new UnauthorizedException('Invalid Token');
    }

    return true;
  }

  /**
   * Extrai o token de autentica o da header do request.
   * @param request Request
   * @returns O token de autentica o se encontrado, caso contr rio undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
