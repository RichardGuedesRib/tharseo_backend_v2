import { Test, TestingModule } from '@nestjs/testing';
import { EngineTharseoController } from './engine-tharseo.controller';
import { AuthGuard } from '../auth/auth.guard';
import { EngineTharseoService } from './engine-tharseo.service';

describe('EngineTharseoController', () => {
  let controller: EngineTharseoController;
  let service: EngineTharseoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineTharseoController],
      providers: [
        {
          provide: EngineTharseoService,
          useValue: {
            startEngineTharseo: jest.fn().mockResolvedValue(undefined),
            checkOrders: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<EngineTharseoController>(EngineTharseoController);
    service = module.get<EngineTharseoService>(EngineTharseoService);
  });

  it('enginetharseo controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  describe('startEngine', () => {
    it('deve chamar startEngineTharseo no serviço', async () => {
      await controller.startEngine();
      expect(service.startEngineTharseo).toHaveBeenCalled();
    });
  });

  describe('checkOrders', () => {
    it('deve chamar checkOrders no serviço', async () => {
      await controller.checkOrders();
      expect(service.checkOrders).toHaveBeenCalled();
    });
  });
});
