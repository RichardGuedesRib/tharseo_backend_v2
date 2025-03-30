import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsBoolean,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsString()
  pairOrderId: string;

  @IsNotEmpty()
  @IsString()
  quantity: string;

  @IsString()
  quantityType: string;

  @IsNotEmpty()
  @IsString()
  side: string;

  @IsString()
  userId: string;

  @IsDate()
  openDate: Date;

  @IsString()
  closePrice: string;

  @IsNotEmpty()
  @IsString()
  typeOrder: string;

  @IsNotEmpty()
  @IsString()
  targetPrice: string;

  @IsString()
  stopPrice: string;

  @IsString()
  status: string;

  @IsBoolean()
  isActive: boolean;
}
