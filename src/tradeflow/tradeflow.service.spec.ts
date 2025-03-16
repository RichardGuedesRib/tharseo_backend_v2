import { Test, TestingModule } from '@nestjs/testing';
import { TradeflowService } from './tradeflow.service';

describe('TradeflowService', () => {
  let service: TradeflowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TradeflowService],
    }).compile();

    service = module.get<TradeflowService>(TradeflowService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
