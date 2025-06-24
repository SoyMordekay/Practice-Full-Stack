export declare class TransactionOrmEntity {
    id: string;
    reference: string;
    amountInCents: number;
    status: string;
    productId: string;
    customerEmail: string;
    createdAt: Date;
    wompiTransactionId?: string;
    wompiResponse?: any;
}
