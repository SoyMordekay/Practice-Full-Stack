import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IDeliveryRepository } from '../../../../domain/repositories/IDelivery.repository';
import { Delivery, CreateDeliveryData, UpdateDeliveryData } from '../../../../domain/entities/delivery.entity';
import { DeliveryOrmEntity } from '../entities/delivery.orm-entity';

@Injectable()
export class DeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryOrmEntity)
    private readonly deliveryRepository: Repository<DeliveryOrmEntity>,
  ) {}

  async findById(id: string): Promise<Delivery | null> {
    const entity = await this.deliveryRepository.findOne({ where: { id } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findAll(): Promise<Delivery[]> {
    const entities = await this.deliveryRepository.find();
    return entities.map(this.mapToDomain);
  }

  async create(data: CreateDeliveryData): Promise<Delivery> {
    const entity = this.deliveryRepository.create({
      ...data,
      ...data.address,
    });
    const saved = await this.deliveryRepository.save(entity);
    return this.mapToDomain(saved);
  }

  async update(id: string, data: UpdateDeliveryData): Promise<Delivery> {
    await this.deliveryRepository.update(id, {
      ...data,
      ...data.address,
    });
    const updated = await this.deliveryRepository.findOne({ where: { id } });
    if (!updated) throw new Error('Delivery not found');
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.deliveryRepository.delete(id);
  }

  private mapToDomain = (entity: DeliveryOrmEntity): Delivery => ({
    id: entity.id,
    transactionId: entity.transactionId,
    customerId: entity.customerId,
    status: entity.status as any,
    trackingNumber: entity.trackingNumber,
    estimatedDeliveryDate: entity.estimatedDeliveryDate,
    actualDeliveryDate: entity.actualDeliveryDate,
    address: {
      street: entity.street,
      city: entity.city,
      state: entity.state,
      zipCode: entity.zipCode,
      country: entity.country,
    },
    notes: entity.notes,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
} 