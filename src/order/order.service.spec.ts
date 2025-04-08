import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { UserService } from '../user/user.service';
import { AssetService } from '../asset/asset.service';
import { BinanceapiService } from '../binance/binanceapi/binanceapi.service';
import { PrismaService } from '../database/prisma.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          }
        },
        {
          provide: AssetService,
          useValue: {
            findOne: jest.fn(),
          }
        },
        {
          provide: BinanceapiService,
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

    service = module.get<OrderService>(OrderService);
  });

  it('order service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
