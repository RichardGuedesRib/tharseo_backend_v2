export default interface NewOcoOrder {
  apiKey: string;
  apiSecret: string;
  quantity: string;
  symbol: string;
  side: string;
  price: string;
  takeProfit: string;
  takeProfitLimit: string;
}
