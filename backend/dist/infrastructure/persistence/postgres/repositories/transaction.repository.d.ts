import { Repository } from 'typeorm';
import { ITransactionRepository } from '../../../../domain/repositories/ITransaction.repository';
import { Transaction, TransactionStatus, CreateTransactionData } from '../../../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';
export declare class TransactionRepositoryPg implements ITransactionRepository {
    private readonly typeOrmRepo;
    constructor(typeOrmRepo: Repository<TransactionOrmEntity>);
    private toDomain;
    create(transactionData: CreateTransactionData): Promise<Transaction>;
    findById(id: string): Promise<Transaction | null>;
    updateStatus(id: string, status: TransactionStatus, wompiTransactionId?: string, wompiResponse?: any): Promise<Transaction>;
    findByReference(reference: string): Promise<Transaction | null>;
}
