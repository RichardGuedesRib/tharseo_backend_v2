import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';

describe('WalletController', () => {
  let controller: WalletController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{
        provide: WalletService,
        useValue:{
          findAll: jest.fn(),
        }
      }],
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: () => true,
    })
    .compile();

    controller = module.get<WalletController>(WalletController);
  });

  it('wallet controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });
});
