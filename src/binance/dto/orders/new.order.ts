interface Fill {
  price?: string;
  qty?: string;
  commission?: string;
  commissionAsset?: string;
  tradeId?: number;
}

export default interface NewOrder {
  orderId?: string;
  apiKey: string;
  apiSecret: string;
  symbol: string;
  side: string;
  typeOrder: string;
  price: string | null;
  quantity: string;
  fills?: Fill[];
}
