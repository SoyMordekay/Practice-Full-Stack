import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITransactionRepository } from '../../../../domain/repositories/ITransaction.repository';
import { Transaction, TransactionStatus, CreateTransactionData } from '../../../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../entities/transaction.orm-entity';

@Injectable()
export class TransactionRepositoryPg implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly typeOrmRepo: Repository<TransactionOrmEntity>,
  ) {}

  private toDomain(ormEntity: TransactionOrmEntity | null): Transaction | null {
    if (!ormEntity) return null;
    const domainEntity = new Transaction();
    Object.assign(domainEntity, ormEntity);
    domainEntity.status = ormEntity.status as TransactionStatus;
    return domainEntity;
  }

  async create(transactionData: CreateTransactionData): Promise<Transaction> {
    const savedEntity = await this.typeOrmRepo.save(transactionData);
    if (!savedEntity) throw new Error('Failed to create transaction in database.');
    return this.toDomain(savedEntity) as Transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    const ormEntity = await this.typeOrmRepo.findOneBy({ id });
    return this.toDomain(ormEntity);
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    const updateResult = await this.typeOrmRepo.update(id, { status });
    if (updateResult.affected === 0) throw new Error(`Transaction with id "${id}" not found.`);
    const updatedOrmEntity = await this.typeOrmRepo.findOneBy({ id });
    if (!updatedOrmEntity) throw new Error(`Failed to retrieve transaction with id "${id}" after update.`);
    return this.toDomain(updatedOrmEntity) as Transaction;
  }
}