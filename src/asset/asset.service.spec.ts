import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './asset.service';
import { PrismaService } from '../database/prisma.service';

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {
          provide: PrismaService,
          useValue: {
            asset: {
              findOne: jest.fn(),
            }
          }
        }],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  it('asset service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
