import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';
import { Delivery } from '../../../domain/entities/delivery.entity';

export interface GetAllDeliveriesResponse {
  deliveries: Delivery[];
}

export class GetAllDeliveriesResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: GetAllDeliveriesResponse,
    public readonly error?: Error
  ) {}

  static success(value: GetAllDeliveriesResponse): GetAllDeliveriesResult {
    return new GetAllDeliveriesResult(true, value);
  }

  static failure(error: Error): GetAllDeliveriesResult {
    return new GetAllDeliveriesResult(false, undefined, error);
  }
}

@Injectable()
export class GetAllDeliveriesUseCase {
  constructor(
    @Inject(IDeliveryRepository) private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(): Promise<GetAllDeliveriesResult> {
    try {
      const deliveries = await this.deliveryRepository.findAll();
      return GetAllDeliveriesResult.success({ deliveries });
    } catch (error) {
      return GetAllDeliveriesResult.failure(error as Error);
    }
  }
} 