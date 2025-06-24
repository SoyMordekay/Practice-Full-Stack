import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';
import { CreateDeliveryData, Delivery } from '../../../domain/entities/delivery.entity';

export interface CreateDeliveryRequest extends CreateDeliveryData {}

export interface CreateDeliveryResponse extends Delivery {}

export class CreateDeliveryResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: CreateDeliveryResponse,
    public readonly error?: Error
  ) {}

  static success(value: CreateDeliveryResponse): CreateDeliveryResult {
    return new CreateDeliveryResult(true, value);
  }

  static failure(error: Error): CreateDeliveryResult {
    return new CreateDeliveryResult(false, undefined, error);
  }
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(IDeliveryRepository) private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(request: CreateDeliveryRequest): Promise<CreateDeliveryResult> {
    try {
      const delivery = await this.deliveryRepository.create(request);
      return CreateDeliveryResult.success(delivery);
    } catch (error) {
      return CreateDeliveryResult.failure(error as Error);
    }
  }
} 