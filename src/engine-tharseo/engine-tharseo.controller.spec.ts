import { Test, TestingModule } from '@nestjs/testing';
import { EngineTharseoController } from './engine-tharseo.controller';

describe('EngineTharseoController', () => {
  let controller: EngineTharseoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineTharseoController],
    }).compile();

    controller = module.get<EngineTharseoController>(EngineTharseoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
