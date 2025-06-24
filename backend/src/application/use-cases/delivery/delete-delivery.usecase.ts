import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';

export interface DeleteDeliveryRequest {
  id: string;
}

export interface DeleteDeliveryResponse {
  success: boolean;
}

export class DeleteDeliveryResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: DeleteDeliveryResponse,
    public readonly error?: Error
  ) {}

  static success(value: DeleteDeliveryResponse): DeleteDeliveryResult {
    return new DeleteDeliveryResult(true, value);
  }

  static failure(error: Error): DeleteDeliveryResult {
    return new DeleteDeliveryResult(false, undefined, error);
  }
}

@Injectable()
export class DeleteDeliveryUseCase {
  constructor(
    @Inject(IDeliveryRepository) private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(request: DeleteDeliveryRequest): Promise<DeleteDeliveryResult> {
    try {
      await this.deliveryRepository.delete(request.id);
      return DeleteDeliveryResult.success({ success: true });
    } catch (error) {
      return DeleteDeliveryResult.failure(error as Error);
    }
  }
} 