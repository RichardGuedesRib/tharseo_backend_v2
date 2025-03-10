// dto/update-asset.dto.ts
import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { Prisma } from '@prisma/client';

/**
 * Classe que representa os dados de um ativo que ser o atualizados.
 * 
 * @example
 * {
 *   name: 'Novo nome do ativo',
 *   symbol: 'NOVO12',
 *   isActive: true
 * }
 */
export class UpdateAssetDto implements Prisma.AssetUpdateInput {
  @IsString()
  @IsOptional() 
  name?: string;

  @IsString()
  @IsOptional() 
  symbol?: string;

  @IsBoolean()
  @IsOptional() 
  isActive?: boolean;
}
