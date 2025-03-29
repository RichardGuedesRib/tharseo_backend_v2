export interface CreateOrderDatabaseDto {
    assetId: string;
    pairOrderId?: string | undefined;
    quantity: string;
    userId: string;
    strategyId: string;
    openDate: Date;
    closeDate?: Date;
    openPrice: string;
    closePrice?: string;
    typeOrder: string;
    targetPrice: string;
    isActive: boolean;
    idOrderExchange: string;
    side: string;
    status: string;
   
}