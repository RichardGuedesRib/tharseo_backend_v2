import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo usuario no banco de dados
   *
   * @param data dados do usuario a ser criado
   * @returns um objeto com os dados do usuario, exceto a senha
   */ async createUser(data: Prisma.UserCreateInput) {
    const createdUser = await this.prisma.user.create({ data });

    const createdCredential = await this.prisma.credential.create({
      data: {
        userId: createdUser.id,
        apiKey: process.env.BINANCE_API_KEY || '',
        secretKey: process.env.BINANCE_API_SECRET || '',
        isActive: true,
      },
    });

    await this.prisma.user.update({
      where: { id: createdUser.id },
      data: {
        credentialId: createdCredential.id,
      },
    });

    const assets = await this.prisma.asset.findMany({});

    for (const asset of assets) {
      await this.prisma.wallet.create({
        data: {
          userId: createdUser.id,
          assetId: asset.id,
          quantity: '100',
          isFavorite: false,
          isActive: true,
        },
      });
    }

    const { password, ...userWithoutPassword } = createdUser;
    return userWithoutPassword;
  }

  /**
   * Retorna um usuário com base no email fornecido.
   *
   * @param email O email do usuário para a busca.
   * @returns Um objeto do usuário encontrado ou null se não existir.
   */

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Retorna todos os usuários cadastrados.
   *
   * @returns Uma lista com todos os usuários cadastrados.
   */
  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  /**
   * Retorna um usuário com base no ID fornecido.
   *
   * @param id O ID do usuário para a busca.
   * @returns Um objeto do usuário encontrado ou null se não existir.
   */

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { wallets: true, credential: true },
    });
    return user;
  }

  async updateProfile(
    userId: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    if (!currentUser) {
      throw new Error('User not found');
    }

    const { email, phone } = updateUserProfileDto;

    if (email !== currentUser.email) {
      const existingUserWithEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUserWithEmail) {
        throw new Error('Email already exists');
      }
    }

    if (phone !== currentUser.phone) {
      const existingUserWithPhone = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingUserWithPhone) {
        throw new Error('Phone already exists');
      }
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: updateUserProfileDto,
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        levelUser: true,
        balance: true,
        isActive: true,
        credentialId: true,
      },
    });
  }

  /**
   * Atualiza a senha de um usuário
   *
   * @param userId ID do usuário
   * @param hashedPassword Senha já criptografada
   * @returns Usuário atualizado
   */
  async updateUserPassword(userId: string, hashedPassword: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        phone: true,
        levelUser: true,
        balance: true,
        isActive: true,
      },
    });
  }
}
