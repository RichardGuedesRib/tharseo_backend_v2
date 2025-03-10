import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';  

@Injectable()
export class AdminGuard extends AuthGuard {
  /**
   * Verifica se o usuário autenticado tem o nível de admin.
   * @param context ExecutionContext
   * @returns boolean Se for admin, retorna true, senão lança erro.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);

    if (!isAuthenticated) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;  

    if (user.levelUser !== 'admin') {
      throw new UnauthorizedException('Acesso restrito para administradores');
    }

    return true;  
  }
}
