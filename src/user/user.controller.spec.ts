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
            getAllUsers: jest.fn().mockResolvedValue([]), 
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
});
