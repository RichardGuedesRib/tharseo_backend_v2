import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';
import { Prisma } from '@prisma/client';


export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsNotEmpty()
  quantity: string;
 
  @IsBoolean()
  @IsNotEmpty()
  isFavorite: boolean;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
