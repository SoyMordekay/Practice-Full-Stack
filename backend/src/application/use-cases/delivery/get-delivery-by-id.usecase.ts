import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';
import { Delivery } from '../../../domain/entities/delivery.entity';

export interface GetDeliveryByIdRequest {
  id: string;
}

export interface GetDeliveryByIdResponse extends Delivery {}

export class GetDeliveryByIdResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: GetDeliveryByIdResponse,
    public readonly error?: Error
  ) {}

  static success(value: GetDeliveryByIdResponse): GetDeliveryByIdResult {
    return new GetDeliveryByIdResult(true, value);
  }

  static failure(error: Error): GetDeliveryByIdResult {
    return new GetDeliveryByIdResult(false, undefined, error);
  }
}

@Injectable()
export class GetDeliveryByIdUseCase {
  constructor(
    @Inject(IDeliveryRepository) private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(request: GetDeliveryByIdRequest): Promise<GetDeliveryByIdResult> {
    try {
      const delivery = await this.deliveryRepository.findById(request.id);
      if (!delivery) {
        return GetDeliveryByIdResult.failure(new Error('Delivery not found'));
      }
      return GetDeliveryByIdResult.success(delivery);
    } catch (error) {
      return GetDeliveryByIdResult.failure(error as Error);
    }
  }
} 