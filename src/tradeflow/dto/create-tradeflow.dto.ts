
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTradeflowDto {

    @IsNotEmpty()
    @IsString() 
    assetId: string;

    @IsNotEmpty()
    @IsString() 
    strategyId: string;

    @IsNotEmpty()
    @IsString() 
    isActive: false;

}
