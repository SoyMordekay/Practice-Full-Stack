import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ICustomerRepository } from '../../domain/repositories/ICustomer.repository';
import { CustomerRepository } from '../persistence/postgres/repositories/customer.repository';
import { CustomerOrmEntity } from '../persistence/postgres/entities/customer.orm-entity';
import { CustomerController } from '../controllers/customer.controller';
import { CreateCustomerUseCase } from '../../application/use-cases/customer/create-customer.usecase';
import { GetAllCustomersUseCase } from '../../application/use-cases/customer/get-all-customers.usecase';
import { GetCustomerByIdUseCase } from '../../application/use-cases/customer/get-customer-by-id.usecase';
import { UpdateCustomerUseCase } from '../../application/use-cases/customer/update-customer.usecase';
import { DeleteCustomerUseCase } from '../../application/use-cases/customer/delete-customer.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerOrmEntity])],
  controllers: [CustomerController],
  providers: [
    {
      provide: ICustomerRepository,
      useClass: CustomerRepository,
    },
    CreateCustomerUseCase,
    GetAllCustomersUseCase,
    GetCustomerByIdUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
  ],
  exports: [ICustomerRepository],
})
export class CustomerModule {} 