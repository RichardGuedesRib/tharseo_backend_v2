import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

describe('WalletController', () => {
  let controller: WalletController;
  let service: WalletService;

  const mockWalletService = {
    createOrUpdate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { userId: 'user123' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WalletController>(WalletController);
    service = module.get<WalletService>(WalletService);

    jest.clearAllMocks();
  });

  it('deve ser criado uma instância do WalletController', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrUpdate', () => {
    it('deve chamar walletService.createOrUpdate com os parâmetros corretos', async () => {
      const dto: CreateWalletDto = {
        assetId: 'asset1',
        quantity: '10',
        isFavorite: true,
        isActive: true,
      };

      const carteiraEsperada = { id: 'wallet123', ...dto };
      mockWalletService.createOrUpdate.mockResolvedValue(carteiraEsperada);

      const resultado = await controller.createOrUpdate(dto, {
        user: mockUser,
      } as any);

      expect(service.createOrUpdate).toHaveBeenCalledWith(dto, mockUser);
      expect(resultado).toEqual(carteiraEsperada);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de carteiras do usuário', async () => {
      const carteiras = [{ id: 'wallet1' }, { id: 'wallet2' }];
      mockWalletService.findAll.mockResolvedValue(carteiras);

      const resultado = await controller.findAll({ user: mockUser });

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(resultado).toEqual(carteiras);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma carteira específica do usuário pelo ID', async () => {
      const carteira = { id: 'wallet1', userId: mockUser.userId };
      mockWalletService.findOne.mockResolvedValue(carteira);

      const resultado = await controller.findOne('wallet1', { user: mockUser });

      expect(service.findOne).toHaveBeenCalledWith('wallet1', mockUser);
      expect(resultado).toEqual(carteira);
    });
  });

  describe('update', () => {
    it('deve chamar walletService.update com os parâmetros corretos', async () => {
      const dto: UpdateWalletDto = { quantity: '20' };
      const carteiraAtualizada = { id: '1', quantity: 20 };

      mockWalletService.update.mockResolvedValue(carteiraAtualizada);

      const resultado = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(resultado).toEqual(carteiraAtualizada);
    });
  });

  describe('remove', () => {
    it('deve chamar remove com o ID correto', async () => {
      mockWalletService.remove.mockResolvedValue({ success: true });

      const resultado = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(resultado).toEqual({ success: true });
    });
  });
});
