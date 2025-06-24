import { Transaction, CreateTransactionData, TransactionStatus } from '../entities/transaction.entity';
export declare const ITransactionRepository: unique symbol;
export interface ITransactionRepository {
    create(transactionData: CreateTransactionData): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    updateStatus(id: string, status: TransactionStatus): Promise<Transaction>;
    findByReference(reference: string): Promise<Transaction | null>;
}
