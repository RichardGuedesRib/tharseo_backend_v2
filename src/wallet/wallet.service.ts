import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { UserService } from 'src/user/user.service';
import { TokenPayload } from 'src/auth/dtos/token.payload';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';
import { AssetService } from 'src/asset/asset.service';

@Injectable()
export class WalletService {
   constructor(
    private readonly prisma: PrismaService, 
    private readonly userService: UserService,
    private readonly assetService: AssetService,
  ) {} 
   
  /**
   * Cria ou atualiza um registro de carteira de um usu rio.
   * 
   * @param createWalletDto Dados da carteira a ser criada ou atualizada.
   * @param user O usu rio que est  criando ou atualizando a carteira.
   * @returns O registro de carteira criado ou atualizado.
   * @throws NotFoundException Caso o usu rio ou o ativo n o sejam encontrados.
   */
  async createOrUpdate(createWalletDto: CreateWalletDto, user: TokenPayload) {
    
    const userWallet = await this.userService.getUserById(user.userId);
    if (!userWallet) {
      throw new NotFoundException('User not found');
    }

    const asset = await this.assetService.findOne(createWalletDto.assetId);
    if(!asset) {
      throw new NotFoundException("Asset not found");
    }

    const existingWallet = userWallet.wallets.find(wallet => wallet.assetId === createWalletDto.assetId);

    if (existingWallet) {
      existingWallet.quantity = createWalletDto.quantity;
      existingWallet.isFavorite = createWalletDto.isFavorite;
      existingWallet.isActive = createWalletDto.isActive;

      return await this.updateWallet(existingWallet.id, existingWallet);
    } else {

      return await this.createWallet(createWalletDto, user.userId); 
    }
  }

/**
 * Atualiza um registro de carteira com base no id fornecido.
 * 
 * @param walletId O id da carteira a ser atualizada.
 * @param updatedData Dados parciais da carteira a serem atualizados.
 * @returns Um objeto com os dados da carteira atualizada.
 */

  async updateWallet(walletId: string, updatedData: Partial<Prisma.WalletCreateInput>) {
    const updatedWallet = await this.prisma.wallet.update({
      where: { id: walletId },
      data: updatedData,
    });
    return updatedWallet; 
  }


  
  /**
   * Cria um novo registro de carteira para um usu rio.
   * 
   * @param createWalletDto dados da carteira a ser criada
   * @param userId id do usu rio que est  solicitando a carteira
   * @returns um objeto com os dados da carteira criada
   */
  async createWallet(createWalletDto: CreateWalletDto, userId: string) {
    const newWallet = await this.prisma.wallet.create({
      data: {
        assetId: createWalletDto.assetId,
        userId: userId,
        quantity: createWalletDto.quantity,
        isFavorite: createWalletDto.isFavorite,
        isActive: createWalletDto.isActive,
      },
    });
    return newWallet; 
  }
  

  /**
   * Retorna todos os registros de carteira de um usu rio.
   * 
   * @param user informa es do usu rio que est  solicitando a lista de carteiras
   * @returns uma lista com os registros de carteira do usu rio
   */
  async findAll(user : TokenPayload) {
    const wallets = await this.prisma.wallet.findMany({where: {userId: user.userId}, include: {asset: true}});
    return wallets;
  }

  /**
   * Retorna um registro de carteira com base no id informado.
   * 
   * @param id id da carteira a ser retornada
   * @param user informa es do usu rio que est  solicitando a carteira
   * @returns um registro de carteira com os dados da carteira solicitada, caso exista
   * @throws NotFoundException caso a carteira nao seja encontrada
   */
  async findOne(id: string, user : TokenPayload) {
    const wallet = await this.prisma.wallet.findUnique({where: {id: id}});
    if(wallet && wallet.userId !== user.userId) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}


