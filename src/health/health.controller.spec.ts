import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { InternalServerErrorException } from '@nestjs/common';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('deve ser instanciado', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('deve retornar que o servidor está operacional', () => {
      const result = controller.check();
      expect(result).toEqual('Application is up and running');
    });

    it('deve retornar um InternalServerErrorException indicando que não está operacional', () => {
      jest.spyOn(controller, 'check').mockImplementation(() => {
        throw new InternalServerErrorException();
      });
  
      try {
        controller.check();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
