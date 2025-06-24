import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentController } from '../controllers/payment.controller';
import { PaymentWithStockController } from '../controllers/payment-with-stock.controller';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { ProcessPaymentWithStockUpdateUseCase } from '../../application/use-cases/process-payment-with-stock-update.usecase';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.usecase';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { ICustomerRepository } from '../../domain/repositories/ICustomer.repository';
import { IDeliveryRepository } from '../../domain/repositories/IDelivery.repository';
import { IWompiGateway } from '../../domain/gateways/IWompi.gateway';
import { TransactionRepositoryPg } from '../persistence/postgres/repositories/transaction.repository';
import { CustomerRepository } from '../persistence/postgres/repositories/customer.repository';
import { DeliveryRepository } from '../persistence/postgres/repositories/delivery.repository';
import { WompiGateway } from '../gateways/wompi/wompi.gateway';
import { TransactionOrmEntity } from '../persistence/postgres/entities/transaction.orm-entity';
import { CustomerOrmEntity } from '../persistence/postgres/entities/customer.orm-entity';
import { DeliveryOrmEntity } from '../persistence/postgres/entities/delivery.orm-entity';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([TransactionOrmEntity, CustomerOrmEntity, DeliveryOrmEntity]),
    ProductModule,
  ],
  controllers: [PaymentController, PaymentWithStockController],
  providers: [
    ProcessPaymentUseCase,
    ProcessPaymentWithStockUpdateUseCase,
    GetTransactionStatusUseCase,
    { provide: ITransactionRepository, useClass: TransactionRepositoryPg },
    { provide: ICustomerRepository, useClass: CustomerRepository },
    { provide: IDeliveryRepository, useClass: DeliveryRepository },
    { provide: IWompiGateway, useClass: WompiGateway },
  ],
})
export class PaymentModule {}
