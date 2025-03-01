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


  @Get('chart-info')
  async getChartInfo() {
    try {
      const response = await this.binanceapiService.getChartInfo('BTCUSDT', '1M', '5');
      console.log('response chart-info', response);
      return response;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('test')
  async testMethod(){

    // const newOrder = {
    //     apiKey : this.apiKey!,
    //     apiSecret : this.apiSecret!, 
    //     symbol : 'BNBUSDT', 
    //     side : 'BUY', 
    //     typeOrder : 'LIMIT', 
    //     price : "620", 
    //     quantity : "1"};

    // const response = await this.binanceapiService.
    // newOrder(newOrder);

    // const cancelOrder : CancelOrderRequest = {
    //     orderId: 5679621,
    //     apiKey : this.apiKey!,
    //     apiSecret : this.apiSecret!,
    //     symbol : 'BNBUSDT'
    // }

    // const response = await this.binanceapiService.
    // cancelOrder(cancelOrder);

    // const getAllOrders : GetOrdersRequest = {
    //   apiKey : this.apiKey!,
    //   apiSecret : this.apiSecret!,
    //   symbol : 'BNBUSDT'
    // }
    // const response = await this.binanceapiService.
    // getAllOrders(getAllOrders);
    // return response;

    // 5695990

    const cancelOrder : CancelOpenOrdersRequest = {
        apiKey : this.apiKey!,
        apiSecret : this.apiSecret!,
        symbol : 'BNBUSDT'
    }
        return await this.binanceapiService.
        cancelOpenOrders(cancelOrder);

  }
}
