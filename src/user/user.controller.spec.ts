import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { AuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getAllUsers: jest.fn().mockResolvedValue([
              { id: 1, name: 'João' },
              { id: 2, name: 'Maria' },
            ]),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('user controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  it('getAllUsers deve retornar dois usuários', async () => {
    const mockUsers = [
      {
        id: 'abc',
        name: 'Usuário 1',
        lastName: 'Sobrenome 1',
        email: 'user1@teste.com',
        phone: '11911111111',
        password: 'senha1',
        levelUser: 'admin',
        balance: 100,
        isActive: true,
        credentialId: null,
      },
      {
        id: 'abc2',
        name: 'Usuário 2',
        lastName: 'Sobrenome 2',
        email: 'user2@teste.com',
        phone: '11922222222',
        password: 'senha2',
        levelUser: 'user',
        balance: 50,
        isActive: false,
        credentialId: null,
      },
    ];

    jest
      .spyOn(controller['userService'], 'getAllUsers')
      .mockResolvedValueOnce(mockUsers);

    const result = await controller.getAllUsers();
    expect(result).toHaveLength(2);
  });
});
