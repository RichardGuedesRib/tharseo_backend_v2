import { IsString, IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreateStrategyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  userId: string;

  @IsString()
  profit: string;

  @IsString()
  performance: string;

  @IsString()
  configStrategy: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
