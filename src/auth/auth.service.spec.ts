import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { LoginRequest } from './dtos/login.request';
import { LoginResponse } from './dtos/login.response';
import * as bcrypt from 'bcrypt';

const mockCounter = {
  inc: jest.fn(),
};

const mockHistogram = {
  startTimer: jest.fn().mockReturnValue(jest.fn()),
};

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserService = {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'PROM_METRIC_AUTH_HTTP_COUNT',
          useValue: mockCounter,
        },
        {
          provide: 'PROM_METRIC_AUTH_HTTP_DURATION_SECONDS',
          useValue: mockHistogram,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('auth service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('deve criar um usuário com sucesso', async () => {
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

      mockUserService.createUser.mockResolvedValue(createUserData);

      const result = await service.signUp(createUserData);

      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createUserData,
          password: expect.any(String), // A senha deve ser hasheada
        }),
      );
      expect(result).toEqual(createUserData);
    });

    it('deve lançar erro ao falhar ao criar usuário', async () => {
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

      mockUserService.createUser.mockRejectedValue(new Error('Erro de banco'));

      await expect(service.signUp(createUserData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('signIn', () => {
    it('deve realizar login com sucesso', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: '123456',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('123456', 10),
        name: 'Test User',
        lastName: 'Example',
        levelUser: 1,
        balance: 1000,
        isActive: true,
      };

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mockJwtToken');

      const result: LoginResponse = await service.signIn(loginRequest);

      expect(mockUserService.getUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          username: mockUser.email,
          levelUser: mockUser.levelUser,
          isActive: mockUser.isActive,
        }),
      );
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          name: mockUser.name,
          lastName: mockUser.lastName,
          email: mockUser.email,
          levelUser: mockUser.levelUser,
          balance: mockUser.balance,
          isActive: mockUser.isActive,
        },
        token: 'mockJwtToken',
        expiresIn: 11200,
      });
    });

    it('deve lançar UnauthorizedException quando email não encontrado', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      mockUserService.getUserByEmail.mockResolvedValue(null);

      await expect(service.signIn(loginRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException quando senha estiver incorreta', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('correctPassword', 10), // Senha incorreta
        name: 'Test User',
        lastName: 'Example',
        levelUser: 1,
        balance: 1000,
        isActive: true,
      };

      mockUserService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(service.signIn(loginRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
