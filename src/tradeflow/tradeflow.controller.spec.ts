import { Test, TestingModule } from '@nestjs/testing';
import { TradeflowController } from './tradeflow.controller';
import { TradeflowService } from './tradeflow.service';
import { AuthGuard } from '../auth/auth.guard';

describe('TradeflowController', () => {
  let controller: TradeflowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeflowController],
      providers: [{
        provide: TradeflowService,
        useValue: {
          findAll: jest.fn().mockResolvedValue([])
        }  
      }],
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: () => true,
    })
    .compile();

    controller = module.get<TradeflowController>(TradeflowController);
  });

  it('tradeflow controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });
});
