import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './asset.service';
import { PrismaService } from '../database/prisma.service';

describe('AssetService', () => {
  let service: AssetService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {
          provide: PrismaService,
          useValue: {
            asset: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('AssetService deve ser instanciado', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e retornar um novo ativo', async () => {
      const data = {
        symbol: 'BTC',
        name: 'Bitcoin',
        isActive: true,
      };

      const mockAsset = { id: '1', ...data };

      (prisma.asset.create as jest.Mock).mockResolvedValue(mockAsset);

      const result = await service.create(data as any);
      expect(prisma.asset.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(mockAsset);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de ativos', async () => {
      const mockAssets = [
        { id: '1', symbol: 'BTC', name: 'Bitcoin', isActive: true },
        { id: '2', symbol: 'ETH', name: 'Ethereum', isActive: true },
      ];

      (prisma.asset.findMany as jest.Mock).mockResolvedValue(mockAssets);

      const result = await service.findAll();
      expect(prisma.asset.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockAssets);
    });
  });

  describe('findOne', () => {
    it('deve retornar um ativo pelo id', async () => {
      const mockAsset = {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        isActive: true,
      };

      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(mockAsset);

      const result = await service.findOne('1');
      expect(prisma.asset.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockAsset);
    });

    it('deve retornar null se o ativo não for encontrado', async () => {
      (prisma.asset.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.findOne('999');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('deve atualizar e retornar o ativo', async () => {
      const data = { name: 'Bitcoin Updated' };
      const updatedAsset = {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin Updated',
        isActive: true,
      };

      (prisma.asset.update as jest.Mock).mockResolvedValue(updatedAsset);

      const result = await service.update('1', data);
      expect(prisma.asset.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data,
      });
      expect(result).toEqual(updatedAsset);
    });
  });

  describe('remove', () => {
    it('deve remover e retornar o ativo removido', async () => {
      const removedAsset = {
        id: '1',
        symbol: 'BTC',
        name: 'Bitcoin',
        isActive: true,
      };

      (prisma.asset.delete as jest.Mock).mockResolvedValue(removedAsset);

      const result = await service.remove('1');
      expect(prisma.asset.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(removedAsset);
    });
  });
});
