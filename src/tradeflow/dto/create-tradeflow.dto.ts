import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateTradeflowDto {
  @IsNotEmpty()
  @IsString()
  assetId: string;

  @IsNotEmpty()
  @IsString()
  strategyId: string;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
