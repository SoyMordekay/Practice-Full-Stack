import { Delivery, CreateDeliveryData, UpdateDeliveryData } from '../entities/delivery.entity';

export const IDeliveryRepository = Symbol('IDeliveryRepository');

export interface IDeliveryRepository {
  findById(id: string): Promise<Delivery | null>;
  findAll(): Promise<Delivery[]>;
  create(data: CreateDeliveryData): Promise<Delivery>;
  update(id: string, data: UpdateDeliveryData): Promise<Delivery>;
  delete(id: string): Promise<void>;
} 