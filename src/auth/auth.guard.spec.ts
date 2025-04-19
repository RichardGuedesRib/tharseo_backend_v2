import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockJwtService: any;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('authguard deve ser instanciado', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('deve retornar true se o token for válido', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };

      const mockPayload = { userId: 1, username: 'test@example.com' };

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await guard.canActivate({
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as any);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken', {
        secret: process.env.SECRET_KEY,
      });
      expect(result).toBe(true);
    });

    it('deve lançar UnauthorizedException se o token não for encontrado', async () => {
      const mockRequest = {
        headers: {},
      };

      await expect(
        guard.canActivate({
          switchToHttp: () => ({ getRequest: () => mockRequest }),
        } as any),
      ).rejects.toThrowError(new UnauthorizedException('Token not found'));
    });

    it('deve lançar UnauthorizedException se o token for inválido', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      };

      jest.spyOn(console, 'error').mockImplementation(() => {});

      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        guard.canActivate({
          switchToHttp: () => ({ getRequest: () => mockRequest }),
        } as any),
      ).rejects.toThrow(new UnauthorizedException('Invalid Token'));
    });
  });

  describe('extractTokenFromHeader', () => {
    it('deve extrair corretamente o token da header', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer validToken',
        },
      };

      const token = guard['extractTokenFromHeader'](mockRequest as any);

      expect(token).toBe('validToken');
    });

    it('deve retornar undefined se a header de authorization estiver ausente', () => {
      const mockRequest = {
        headers: {},
      };

      const token = guard['extractTokenFromHeader'](mockRequest as any);

      expect(token).toBeUndefined();
    });

    it('deve retornar undefined se o tipo não for "Bearer"', () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic someOtherToken',
        },
      };

      const token = guard['extractTokenFromHeader'](mockRequest as any);

      expect(token).toBeUndefined();
    });
  });
});
