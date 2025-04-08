import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/auth.guard';

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{
        provide: OrderService,
        useValue: {
          findAll: jest.fn().mockResolvedValue([]),
        },
      }],
    })
    .overrideGuard(AuthGuard)
    .useValue({
      canActivate: () => true,
    })
    .compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('order controller deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });
});
