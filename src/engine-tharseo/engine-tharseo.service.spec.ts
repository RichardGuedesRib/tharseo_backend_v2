import { Test, TestingModule } from '@nestjs/testing';
import { EngineTharseoService } from './engine-tharseo.service';

describe('EngineTharseoService', () => {
  let service: EngineTharseoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineTharseoService],
    }).compile();

    service = module.get<EngineTharseoService>(EngineTharseoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
