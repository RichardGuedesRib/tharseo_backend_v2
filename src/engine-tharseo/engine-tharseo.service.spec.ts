import { Test, TestingModule } from '@nestjs/testing';
import { EngineTharseoService } from './engine-tharseo.service';
import { BinanceapiService } from '../binance/binanceapi/binanceapi.service';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../database/prisma.service';

describe('EngineTharseoService', () => {
  let service: EngineTharseoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngineTharseoService,
        {
          provide: BinanceapiService,
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide : OrderService,
          useValue: {
            findOne: jest.fn(),
          }
        },
        {
          provide: PrismaService,
          useValue: {
            findOne: jest.fn(),
          }
        }
      ],
    }).compile();

    service = module.get<EngineTharseoService>(EngineTharseoService);
  });

  it('enginetharseo service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
