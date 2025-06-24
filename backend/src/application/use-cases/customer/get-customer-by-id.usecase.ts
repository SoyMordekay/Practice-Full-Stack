import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';
import { Customer } from '../../../domain/entities/customer.entity';

export interface GetCustomerByIdRequest {
  id: string;
}

export interface GetCustomerByIdResponse extends Customer {}

export class GetCustomerByIdResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: GetCustomerByIdResponse,
    public readonly error?: Error
  ) {}

  static success(value: GetCustomerByIdResponse): GetCustomerByIdResult {
    return new GetCustomerByIdResult(true, value);
  }

  static failure(error: Error): GetCustomerByIdResult {
    return new GetCustomerByIdResult(false, undefined, error);
  }
}

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(ICustomerRepository) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(request: GetCustomerByIdRequest): Promise<GetCustomerByIdResult> {
    try {
      const customer = await this.customerRepository.findById(request.id);
      if (!customer) {
        return GetCustomerByIdResult.failure(new Error('Customer not found'));
      }
      return GetCustomerByIdResult.success(customer);
    } catch (error) {
      return GetCustomerByIdResult.failure(error as Error);
    }
  }
} 