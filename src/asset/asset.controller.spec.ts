import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/guards/admin/admin.guard';
import { NotFoundException } from '@nestjs/common';

describe('AssetController', () => {
  let controller: AssetController;
  let service: AssetService;

  const mockAsset = {
    id: '1',
    name: 'Ativo 1',
    description: 'Descrição do ativo',
  };

  const assetServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        {
          provide: AssetService,
          useValue: assetServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AssetController>(AssetController);
    service = module.get<AssetService>(AssetService);

    jest.clearAllMocks(); // Limpa mocks a cada teste
  });

  it('deve instanciar o controller', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo ativo', async () => {
      const dto = { name: 'Novo Ativo', description: 'Descrição' };
      assetServiceMock.create.mockResolvedValue(mockAsset);

      const result = await controller.create(dto as any);
      expect(result).toEqual(mockAsset);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os ativos', async () => {
      assetServiceMock.findAll.mockResolvedValue([mockAsset]);

      const result = await controller.findAll();
      expect(result).toEqual([mockAsset]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar o ativo pelo ID', async () => {
      assetServiceMock.findOne.mockResolvedValue(mockAsset);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockAsset);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('deve lançar exceção se o ativo não existir', async () => {
      assetServiceMock.findOne.mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o ativo se ele existir', async () => {
      const updated = { ...mockAsset, name: 'Atualizado' };
      assetServiceMock.findOne.mockResolvedValue(mockAsset);
      assetServiceMock.update.mockResolvedValue(updated);

      const result = await controller.update('1', { name: 'Atualizado' } as any);
      expect(result).toEqual(updated);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(service.update).toHaveBeenCalledWith('1', { name: 'Atualizado' });
    });

    it('deve lançar exceção se o ativo não existir', async () => {
      assetServiceMock.findOne.mockResolvedValue(null);

      await expect(
        controller.update('1', { name: 'Atualizado' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover o ativo se ele existir', async () => {
      assetServiceMock.findOne.mockResolvedValue(mockAsset);
      assetServiceMock.remove.mockResolvedValue(mockAsset);

      const result = await controller.remove('1');
      expect(result).toEqual(mockAsset);
      expect(service.remove).toHaveBeenCalledWith('1');
    });

    it('deve lançar exceção se o ativo não existir', async () => {
      assetServiceMock.findOne.mockResolvedValue(null);

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
