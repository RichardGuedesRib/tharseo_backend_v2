import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin.guard';
import { JwtService } from '@nestjs/jwt';

describe('AdminGuard', () => {
  let adminGuard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    adminGuard = module.get<AdminGuard>(AdminGuard);
  });

  it('adminguard deve ser instanciado', () => {
    expect(adminGuard).toBeDefined();
  });
});
