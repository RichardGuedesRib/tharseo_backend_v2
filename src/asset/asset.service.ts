import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria um novo ativo.
   *
   * @param data dados do ativo a ser criado
   * @param userId id do usuario que esta criando o ativo
   * @returns um objeto com os dados do ativo criado
   */

  async create(data: Prisma.AssetCreateInput) {
    return await this.prisma.asset.create({ data });
  }

  /**
   * Retorna todos os ativos da base de dados.
   *
   * @param userId id do usuario que esta solicitando os ativos
   * @returns uma lista com todos os ativos cadastrados na base de dados
   */
  async findAll() {
    return await this.prisma.asset.findMany();
  }

  /**
   * Retorna um ativo com base no id informado.
   *
   * @param id id do ativo a ser retornado
   * @param userId id do usuario que esta solicitando o ativo
   * @returns um objeto com os dados do ativo solicitado, caso exista
   * @throws NotFoundException caso o ativo nao seja encontrado
   */
  async findOne(id: string) {
    return await this.prisma.asset.findUnique({ where: { id } });
  }

  /**
   * Atualiza um ativo com base no id informado.
   *
   * @param id id do ativo a ser atualizado
   * @param data dados do ativo a serem atualizados
   * @returns um objeto com os dados do ativo atualizado
   * @throws NotFoundException caso o ativo nao seja encontrado
   */
  async update(id: string, data: Prisma.AssetUpdateInput) {
    return await this.prisma.asset.update({ where: { id }, data });
  }

  /**
   * Remove um ativo da base de dados com base no id informado.
   *
   * @param id id do ativo a ser removido
   * @param userId id do usuario que esta solicitando a remocao do ativo
   * @returns um objeto com os dados do ativo removido
   * @throws NotFoundException caso o ativo nao seja encontrado
   */
  remove(id: string) {
    return this.prisma.asset.delete({ where: { id } });
  }
}
