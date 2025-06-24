import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';
import { UpdateDeliveryData, Delivery } from '../../../domain/entities/delivery.entity';

export interface UpdateDeliveryRequest {
  id: string;
  data: UpdateDeliveryData;
}

export interface UpdateDeliveryResponse extends Delivery {}

export class UpdateDeliveryResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: UpdateDeliveryResponse,
    public readonly error?: Error
  ) {}

  static success(value: UpdateDeliveryResponse): UpdateDeliveryResult {
    return new UpdateDeliveryResult(true, value);
  }

  static failure(error: Error): UpdateDeliveryResult {
    return new UpdateDeliveryResult(false, undefined, error);
  }
}

@Injectable()
export class UpdateDeliveryUseCase {
  constructor(
    @Inject(IDeliveryRepository) private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(request: UpdateDeliveryRequest): Promise<UpdateDeliveryResult> {
    try {
      const delivery = await this.deliveryRepository.update(request.id, request.data);
      if (!delivery) {
        return UpdateDeliveryResult.failure(new Error('Delivery not found'));
      }
      return UpdateDeliveryResult.success(delivery);
    } catch (error) {
      return UpdateDeliveryResult.failure(error as Error);
    }
  }
} 