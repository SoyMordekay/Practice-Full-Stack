import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';
import { CreateCustomerData, Customer } from '../../../domain/entities/customer.entity';

export interface CreateCustomerRequest extends CreateCustomerData {}

export interface CreateCustomerResponse extends Customer {}

export class CreateCustomerResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: CreateCustomerResponse,
    public readonly error?: Error
  ) {}

  static success(value: CreateCustomerResponse): CreateCustomerResult {
    return new CreateCustomerResult(true, value);
  }

  static failure(error: Error): CreateCustomerResult {
    return new CreateCustomerResult(false, undefined, error);
  }
}

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(request: CreateCustomerRequest): Promise<CreateCustomerResult> {
    try {
      const customer = await this.customerRepository.create(request);
      return CreateCustomerResult.success(customer);
    } catch (error) {
      return CreateCustomerResult.failure(error as Error);
    }
  }
} 