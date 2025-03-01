import { Test, TestingModule } from '@nestjs/testing';
import { BinanceapiController } from './binanceapi.controller';

describe('BinanceapiController', () => {
  let controller: BinanceapiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BinanceapiController],
    }).compile();

    controller = module.get<BinanceapiController>(BinanceapiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
