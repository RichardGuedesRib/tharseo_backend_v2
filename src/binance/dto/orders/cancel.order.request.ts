export default interface CancelOrderRequest {
  apiKey: string;
  apiSecret: string;
  symbol: string;
  orderId: number;
}
