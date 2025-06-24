export type TransactionStatus = 'PENDING' | 'APPROVED' | 'DECLINED';
export type CreateTransactionData = Omit<Transaction, 'id' | 'createdAt'>;
export declare class Transaction {
    id: string;
    reference: string;
    amountInCents: number;
    status: TransactionStatus;
    productId: string;
    customerEmail: string;
    createdAt: Date;
    wompiTransactionId?: string;
    wompiResponse?: any;
}
