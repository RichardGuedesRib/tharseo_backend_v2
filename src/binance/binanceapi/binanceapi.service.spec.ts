import { Test, TestingModule } from '@nestjs/testing';
import { BinanceapiService } from './binanceapi.service';

describe('BinanceapiService', () => {
  let service: BinanceapiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinanceapiService],
    }).compile();

    service = module.get<BinanceapiService>(BinanceapiService);
  });

  it('binanceapi service deve ser instanciado', () => {
    expect(service).toBeDefined();
  });
});
