import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsBoolean,
  isString,
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

  @IsDate()
  closeDate: Date;

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

  @IsString()
  idOrderExchange: string;

  @IsString()
  result: string;

  @IsString()
  strategyId: string;

  @IsString()
  performance: string;
}
