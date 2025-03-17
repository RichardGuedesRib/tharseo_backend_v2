import { IsString, IsNotEmpty, IsNumber, IsDate, IsBoolean } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()  
  assetId : string;

  @IsNotEmpty()
  @IsString()
  quantity : string;

  @IsNotEmpty()
  @IsString()
  side : string;

  @IsString()
  userId : string;

  @IsString()
  strategyId : string;

  @IsNotEmpty()
  @IsDate()
  openDate : Date;

  @IsDate()
  closeDate : Date;

  @IsNotEmpty()
  @IsNumber()
  openPrice : number;

  @IsNumber()
  closePrice : number;

  @IsNotEmpty()
  @IsString()
  typeOrder : string;

  @IsNotEmpty()
  @IsNumber()
  targetPrice : number;

  @IsNumber()
  stopPrice : number;

  @IsNumber()
  result : number;

  @IsNotEmpty()
  @IsString()
  status : string;

  @IsNotEmpty()
  @IsBoolean()
  isActive : boolean;
}
