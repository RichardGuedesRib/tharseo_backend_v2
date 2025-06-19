import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Binance from 'binance-api-node';

interface BinanceTicker {
  symbol: string;
  price: string;
}

@Injectable()
export class BinanceWsService implements OnModuleInit, OnModuleDestroy {
  private client = Binance();
  private prices: Record<string, string> = {};
  private wsTicker: any;

  onModuleInit() {
    if (process.env.NODE_ENV !== 'test') {
      this.subscribeToMarket();
    }
  }

  private subscribeToMarket() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

    this.wsTicker = this.client.ws.ticker(symbols, (data) => {
      const ticker: BinanceTicker = { symbol: data.symbol, price: data.open };
      this.prices[ticker.symbol] = ticker.price;
    });
  }

  onModuleDestroy() {
    if (this.wsTicker && typeof this.wsTicker.close === 'function') {
      this.wsTicker.close();
    }
  }

  getPrice(symbol: string): string | null {
    return this.prices[symbol] || null;
  }

  getAllPrices(): Record<string, string> {
    return this.prices;
  }
}
