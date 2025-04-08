import { Test, TestingModule } from '@nestjs/testing';
import { EngineTharseoController } from './engine-tharseo.controller';
import { AuthGuard } from '../auth/auth.guard';
import { EngineTharseoService } from './engine-tharseo.service';

describe('EngineTharseoController', () => {
  let controller: EngineTharseoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineTharseoController],
      providers: [
        {
          provide: EngineTharseoService,
          useValue: {
            startEngine: jest.fn().mockResolvedValue([]),
          },
        },],
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: () => true,
    })
    .compile();

    controller = module.get<EngineTharseoController>(EngineTharseoController);
  });

  it('enginetharseo controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });
});
