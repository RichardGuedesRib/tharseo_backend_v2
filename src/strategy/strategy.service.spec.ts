import { Test, TestingModule } from '@nestjs/testing';
import { StrategyService } from './strategy.service';
import { PrismaService } from '../database/prisma.service';
import { UserService } from '../user/user.service';

describe('StrategyService', () => {
  let service: StrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategyService,
        {
          provide: PrismaService,
          useValue: {
            strategy: {
              findMany: jest.fn(),
            }
          }
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<StrategyService>(StrategyService);
  });

  it('strategy service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
