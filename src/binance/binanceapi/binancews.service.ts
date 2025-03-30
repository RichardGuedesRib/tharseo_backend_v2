import { Injectable, OnModuleInit } from '@nestjs/common';
import Binance from 'binance-api-node';

interface BinanceTicker {
  symbol: string;
  price: string;
}

@Injectable()
export class BinanceWsService implements OnModuleInit {
  private client = Binance();
  private prices: Record<string, string> = {};

  onModuleInit() {
    this.subscribeToMarket();
  }

  private subscribeToMarket() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

    this.client.ws.ticker(symbols, (data) => {
      const ticker: BinanceTicker = { symbol: data.symbol, price: data.open };

      this.prices[ticker.symbol] = ticker.price;

      // console.log(`📈 ${ticker.symbol}: $${ticker.price}`);
    });
  }

  getPrice(symbol: string): string | null {
    return this.prices[symbol] || null;
  }

  getAllPrices(): Record<string, string> {
    return this.prices;
  }
}
