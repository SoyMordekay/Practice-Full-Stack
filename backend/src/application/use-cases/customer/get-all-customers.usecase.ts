import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';
import { Customer } from '../../../domain/entities/customer.entity';

export interface GetAllCustomersResponse {
  customers: Customer[];
}

export class GetAllCustomersResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: GetAllCustomersResponse,
    public readonly error?: Error
  ) {}

  static success(value: GetAllCustomersResponse): GetAllCustomersResult {
    return new GetAllCustomersResult(true, value);
  }

  static failure(error: Error): GetAllCustomersResult {
    return new GetAllCustomersResult(false, undefined, error);
  }
}

@Injectable()
export class GetAllCustomersUseCase {
  constructor(
    @Inject(ICustomerRepository) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(): Promise<GetAllCustomersResult> {
    try {
      const customers = await this.customerRepository.findAll();
      return GetAllCustomersResult.success({ customers });
    } catch (error) {
      return GetAllCustomersResult.failure(error as Error);
    }
  }
} 