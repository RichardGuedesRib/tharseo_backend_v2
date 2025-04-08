import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../database/prisma.service';
import { UserService } from '../user/user.service';
import { AssetService } from '../asset/asset.service';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService, 
        {
          provide: PrismaService,
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: AssetService,
          useValue: {
            findOne: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('wallet service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
