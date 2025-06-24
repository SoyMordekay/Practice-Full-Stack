import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';

export interface DeleteCustomerRequest {
  id: string;
}

export interface DeleteCustomerResponse {
  success: boolean;
}

export class DeleteCustomerResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: DeleteCustomerResponse,
    public readonly error?: Error
  ) {}

  static success(value: DeleteCustomerResponse): DeleteCustomerResult {
    return new DeleteCustomerResult(true, value);
  }

  static failure(error: Error): DeleteCustomerResult {
    return new DeleteCustomerResult(false, undefined, error);
  }
}

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(ICustomerRepository) private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(request: DeleteCustomerRequest): Promise<DeleteCustomerResult> {
    try {
      await this.customerRepository.delete(request.id);
      return DeleteCustomerResult.success({ success: true });
    } catch (error) {
      return DeleteCustomerResult.failure(error as Error);
    }
  }
} 