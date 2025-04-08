import { Test, TestingModule } from '@nestjs/testing';
import { TradeflowService } from './tradeflow.service';
import { PrismaService } from '../database/prisma.service';
import { StrategyService } from '../strategy/strategy.service';
import { AssetService } from '../asset/asset.service';
import { EngineTharseoService } from '../engine-tharseo/engine-tharseo.service';

describe('TradeflowService', () => {
  let service: TradeflowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeflowService,
        {
          provide: PrismaService,
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: StrategyService,
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: AssetService,
          useValue: {
            findOne: jest.fn(),
          }
        },
        {
          provide: EngineTharseoService,
          useValue: {
            findOne: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<TradeflowService>(TradeflowService);
  });

  it('tradeflow service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
