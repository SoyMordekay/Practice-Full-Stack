import { Inject, Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import {
  IWompiGateway,
  WompiPaymentResponse,
} from '../../domain/gateways/IWompi.gateway';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/entities/transaction.entity';
import { v4 as uuidv4 } from 'uuid';

type Result<S, F> =
  | { isSuccess: true; value: S }
  | { isSuccess: false; error: F };

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(ITransactionRepository)
    private readonly transactionRepo: ITransactionRepository,
    @Inject(IProductRepository)
    private readonly productRepo: IProductRepository,
    @Inject(IWompiGateway) private readonly wompiGateway: IWompiGateway,
  ) {}

  async execute(dto: CreatePaymentDto): Promise<Result<Transaction, Error>> {
    const product = await this.productRepo.findById(dto.productId);
    if (!product)
      return { isSuccess: false, error: new Error('Product not found') };
    if (!product.hasStock(1))
      return { isSuccess: false, error: new Error('Insufficient stock') };

    const reference = uuidv4();
    const transaction = await this.transactionRepo.create({
      productId: product.id,
      reference: reference,
      amountInCents: product.price * 100,
      status: 'PENDING',
      customerEmail: dto.customerEmail,
    });

    let wompiResponse: WompiPaymentResponse;
    try {
      wompiResponse = await this.wompiGateway.createPayment({
        amountInCents: transaction.amountInCents,
        currency: 'COP',
        customerEmail: dto.customerEmail,
        reference: reference,
        paymentMethod: {
          type: 'CARD',
          token: dto.creditCardToken,
          installments: dto.installments,
        },
      });
    } catch {
      await this.transactionRepo.updateStatus(transaction.id, 'DECLINED');
      return { isSuccess: false, error: new Error('Payment provider error') };
    }

    const finalStatus: TransactionStatus =
      wompiResponse.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';
    const updatedTransaction = await this.transactionRepo.updateStatus(
      transaction.id,
      finalStatus,
    );

    if (finalStatus === 'APPROVED') {
      await this.productRepo.decreaseStock(product.id, 1);
    }

    return { isSuccess: true, value: updatedTransaction };
  }
}
