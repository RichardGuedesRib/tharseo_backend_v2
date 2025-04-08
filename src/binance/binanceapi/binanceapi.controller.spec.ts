import { Test, TestingModule } from '@nestjs/testing';
import { BinanceapiController } from './binanceapi.controller';
import { AuthGuard } from '../../auth/auth.guard';
import { BinanceapiService } from '../binanceapi/binanceapi.service';

describe('BinanceapiController', () => {
  let controller: BinanceapiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinanceapiController],
      providers: [
        {
          provide: BinanceapiService,
          useValue: {
            binanceapi: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: () => true,
    })
    .compile();

    controller = module.get<BinanceapiController>(BinanceapiController);
  });

  it('binanceapi controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });
});
