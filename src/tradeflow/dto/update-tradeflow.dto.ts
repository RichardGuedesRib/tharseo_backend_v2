import { PartialType } from '@nestjs/mapped-types';
import { CreateTradeflowDto } from './create-tradeflow.dto';

export class UpdateTradeflowDto extends PartialType(CreateTradeflowDto) {}
