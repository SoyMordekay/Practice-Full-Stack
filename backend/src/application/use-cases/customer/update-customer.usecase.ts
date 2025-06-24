import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';
import { UpdateCustomerData, Customer } from '../../../domain/entities/customer.entity';

export interface UpdateCustomerRequest {
  id: string;
  data: UpdateCustomerData;
}

export interface UpdateCustomerResponse extends Customer {}

export class UpdateCustomerResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: UpdateCustomerResponse,
    public readonly error?: Error
  ) {}

  static success(value: UpdateCustomerResponse): UpdateCustomerResult {
    return new UpdateCustomerResult(true, value);
  }

  static failure(error: Error): UpdateCustomerResult {
    return new UpdateCustomerResult(false, undefined, error);
  }
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(request: UpdateCustomerRequest): Promise<UpdateCustomerResult> {
    try {
      const customer = await this.customerRepository.update(request.id, request.data);
      if (!customer) {
        return UpdateCustomerResult.failure(new Error('Customer not found'));
      }
      return UpdateCustomerResult.success(customer);
    } catch (error) {
      return UpdateCustomerResult.failure(error as Error);
    }
  }
} 