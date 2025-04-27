import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { PrismaService } from '../database/prisma.service';
import { UserService } from '../user/user.service';
import { AssetService } from '../asset/asset.service';
import { NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TokenPayload } from '../auth/dtos/token.payload';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: PrismaService;
  let userService: UserService;
  let assetService: AssetService;

  const userPayload: TokenPayload = { userId: 'user-id', levelUser: 'admin', userName: 'alunodsm', isActive: true };

  const createWalletDto: CreateWalletDto = {
    assetId: 'asset-id',
    quantity: '10.0',
    isFavorite: true,
    isActive: true,
  };

  const mockWallet = {
    id: 'wallet-id',
    assetId: 'asset-id',
    userId: 'user-id',
    quantity: '10.0',
    isFavorite: true,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: PrismaService,
          useValue: {
            wallet: {
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserById: jest.fn(),
          },
        },
        {
          provide: AssetService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
    assetService = module.get<AssetService>(AssetService);
  });

  describe('createOrUpdate', () => {
    it('deve criar uma nova wallet se não existir', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-id',
        wallets: [],
      });
      (assetService.findOne as jest.Mock).mockResolvedValue({ id: 'asset-id' });
      (prisma.wallet.create as jest.Mock).mockResolvedValue(mockWallet);

      const result = await service.createOrUpdate(createWalletDto, userPayload);

      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.create).toHaveBeenCalled();
    });

    it('deve atualizar uma carteira existente', async () => {
      const existingWallet = { ...mockWallet, ...createWalletDto };
      (userService.getUserById as jest.Mock).mockResolvedValue({
        id: 'user-id',
        wallets: [existingWallet],
      });
      (assetService.findOne as jest.Mock).mockResolvedValue({ id: 'asset-id' });
      (prisma.wallet.update as jest.Mock).mockResolvedValue(existingWallet);

      const result = await service.createOrUpdate(createWalletDto, userPayload);

      expect(result).toEqual(existingWallet);
      expect(prisma.wallet.update).toHaveBeenCalled();
    });

    it('deve lançar uma excessão se um usuário não for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(service.createOrUpdate(createWalletDto, userPayload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar uma excessão se um ativo nao for encontrado', async () => {
      (userService.getUserById as jest.Mock).mockResolvedValue({ id: 'user-id', wallets: [] });
      (assetService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.createOrUpdate(createWalletDto, userPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateWallet', () => {
    it('deve atualizar e retornar uma wallet', async () => {
      const updated = { ...mockWallet, quantity: '20.0' };
      (prisma.wallet.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateWallet('wallet-id', { quantity: '20.0' });

      expect(result).toEqual(updated);
      expect(prisma.wallet.update).toHaveBeenCalledWith({
        where: { id: 'wallet-id' },
        data: { quantity: '20.0' },
      });
    });
  });

  describe('createWallet', () => {
    it('deve criar e retornar uma nova wallet', async () => {
      (prisma.wallet.create as jest.Mock).mockResolvedValue(mockWallet);

      const result = await service.createWallet(createWalletDto, 'user-id');

      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.create).toHaveBeenCalledWith({
        data: {
          assetId: 'asset-id',
          userId: 'user-id',
          quantity: '10.0',
          isFavorite: true,
          isActive: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as carteiras do usuário', async () => {
      (prisma.wallet.findMany as jest.Mock).mockResolvedValue([mockWallet]);

      const result = await service.findAll(userPayload);

      expect(result).toEqual([mockWallet]);
      expect(prisma.wallet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: { asset: true },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar se existir, uma carteira do usuário', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue(mockWallet);

      const result = await service.findOne('wallet-id', userPayload);

      expect(result).toEqual(mockWallet);
      expect(prisma.wallet.findUnique).toHaveBeenCalledWith({ where: { id: 'wallet-id' } });
    });

    it('deve lançar uma excessão se a wallet não pertencer ao usuário', async () => {
      (prisma.wallet.findUnique as jest.Mock).mockResolvedValue({ ...mockWallet, userId: 'other' });

      await expect(service.findOne('wallet-id', userPayload)).rejects.toThrow(NotFoundException);
    });
  });
});
