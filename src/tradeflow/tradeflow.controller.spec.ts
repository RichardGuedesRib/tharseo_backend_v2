import { Test, TestingModule } from '@nestjs/testing';
import { TradeflowController } from './tradeflow.controller';
import { TradeflowService } from './tradeflow.service';

describe('TradeflowController', () => {
  let controller: TradeflowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradeflowController],
      providers: [TradeflowService],
    }).compile();

    controller = module.get<TradeflowController>(TradeflowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
