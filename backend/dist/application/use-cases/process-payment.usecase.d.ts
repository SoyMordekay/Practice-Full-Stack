import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { IWompiGateway } from '../../domain/gateways/IWompi.gateway';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
type Result<S, F> = {
    isSuccess: true;
    value: S;
} | {
    isSuccess: false;
    error: F;
};
export declare class ProcessPaymentUseCase {
    private readonly transactionRepo;
    private readonly productRepo;
    private readonly wompiGateway;
    constructor(transactionRepo: ITransactionRepository, productRepo: IProductRepository, wompiGateway: IWompiGateway);
    execute(dto: CreatePaymentDto): Promise<Result<Transaction, Error>>;
}
export {};
