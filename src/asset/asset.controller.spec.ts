import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/guards/admin/admin.guard';

describe('AssetController', () => {
  let controller: AssetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [{
        provide: AssetService,
        useValue: {
          getAllAssets: jest.fn().mockResolvedValue([]),
        },
      }],
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: () => true,
    })
    .overrideGuard(AdminGuard)
    .useValue({
      canActivate: () => true,
    })
    .compile();

    controller = module.get<AssetController>(AssetController);
  });

  it('asset controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });
});
