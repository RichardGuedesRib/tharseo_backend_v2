import { Body, Controller, Get, Inject, Query } from '@nestjs/common';
import { BinanceapiService } from './binanceapi.service';
import NewOrder from '../dto/orders/new.order';
import CancelOrderRequest from '../dto/orders/cancel.order.request';
import GetOrdersRequest from '../dto/market/get.all.orders.request';
import CancelOpenOrdersRequest from '../dto/orders/cancel.open.order.request';

@Controller('binanceapi')
export class BinanceapiController {
  @Inject()
  private readonly binanceapiService: BinanceapiService;

  private readonly apiKey = process.env.BINANCE_API_KEY;
  private readonly apiSecret = process.env.BINANCE_API_SECRET;

  
}
