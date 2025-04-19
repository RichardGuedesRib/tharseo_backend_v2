import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateStrategyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  profit: string;

  @IsString()
  @IsOptional()
  performance: string;

  @IsString()
  @IsOptional()
  configStrategy: string;

  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
