// dto/create-asset.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { Prisma } from '@prisma/client';

/**
 * Classe utilizada para criar um novo ativo.
 * 
 * @remarks
 * Essa classe   utilizada pelo controller de ativos para criar um novo ativo.
 * Ela   utilizada pelo service de ativos para validar os dados recebidos.
 * 
 * @property {string} name - nome do ativo.
 * @property {string} symbol - simbolo do ativo.
 * @property {boolean} isActive - flag indicando se o ativo est  ativo.
 */
export class CreateAssetDto implements Prisma.AssetCreateInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
 
}
