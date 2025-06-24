import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.usecase';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
export declare class PaymentController {
    private readonly processPaymentUseCase;
    private readonly getTransactionStatusUseCase;
    constructor(processPaymentUseCase: ProcessPaymentUseCase, getTransactionStatusUseCase: GetTransactionStatusUseCase);
    create(createPaymentDto: CreatePaymentDto): Promise<import("../../domain/entities/transaction.entity").Transaction>;
    getTransactionStatus(transactionId: string): Promise<import("../../application/use-cases/get-transaction-status.usecase").GetTransactionStatusResponse | undefined>;
}
