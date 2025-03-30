export interface CreateOrderExchangeRequest {
  apiKey: string;
  secretKey: string;
  symbol: string;
  side: string;
  typeOrder: string;
  price: string;
  quantity: string;
  target: string;
}
