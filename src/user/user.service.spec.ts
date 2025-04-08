import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            findOne: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('user service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
