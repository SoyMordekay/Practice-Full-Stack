import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from '../controllers/payment.controller';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IWompiGateway } from '../../domain/gateways/IWompi.gateway';
import { TransactionRepositoryPg } from '../persistence/postgres/repositories/transaction.repository';
import { WompiGateway } from '../gateways/wompi/wompi.gateway';
import { TransactionOrmEntity } from '../persistence/postgres/entities/transaction.orm-entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([TransactionOrmEntity]),
    ProductModule,
  ],
  controllers: [PaymentController],
  providers: [
    ProcessPaymentUseCase,
    { provide: ITransactionRepository, useClass: TransactionRepositoryPg },
    { provide: IWompiGateway, useClass: WompiGateway },
  ],
})
export class PaymentModule {}