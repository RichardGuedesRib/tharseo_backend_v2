import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginRequest } from './dtos/login.request';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('authcontroller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('deve criar e retornar um novo usuario', async () => {
      const createUserData = {
        email: 'test@example.com',
        password: '123456',
        name: 'Test User',
        lastName: 'Example',
        phone: '11912345678',
        levelUser: 'admin',
        balance: 1000,
        isActive: true,
      };

      const expectedUserCreated = {
        id: 'user-id',
        ...createUserData,
      };

      (service.signUp as jest.Mock).mockResolvedValue(expectedUserCreated);

      const result = await controller.signUp(createUserData);

      expect(result).toEqual(expectedUserCreated);
    });

    it('deve retornar um erro se o usuario nao for criado', async () => {
      (service.signUp as jest.Mock).mockRejectedValue(
        new BadRequestException('Erro ao cadastrar usuário'),
      );

      const createUserData = {
        email: 'test@example.com',
        password: '123456',
        name: 'Test User',
        lastName: 'Example',
        phone: '11912345678',
        levelUser: 'admin',
        balance: 1000,
        isActive: true,
      };

      await expect(controller.signUp(createUserData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('deve retornar um payload de autenticacao', async () => {
      const authMock = {
        user: {
          id: 'user-id',
          name: 'user.name',
          lastName: 'user.lastName',
          email: 'user.email',
          levelUser: 'user.levelUser',
          balance: 'user.balance',
          isActive: 'user.isActive',
        },
        token: 'dsadsadsadsadsadsadsadsd',
        expiresIn: 11200,
      };

      const loginRequestMock: LoginRequest = {
        email: 'user@user.com',
        password: '123456',
      };

      (service.signIn as jest.Mock).mockResolvedValue(authMock);

      const result = await controller.signIn(loginRequestMock);
      expect(result).toEqual(authMock);
      expect(result.token).toBeDefined();
    });

    it("deve retornar UnauthorizedException se o login falhar", async () => {
      const loginRequestMock: LoginRequest = {
        email: 'user@user.com',
        password: '123456',
      };

      (service.signIn as jest.Mock).mockRejectedValue(new UnauthorizedException('Email ou senha incorretos'));

      await expect(controller.signIn(loginRequestMock)).rejects.toThrow(UnauthorizedException);
    });
  });
});
