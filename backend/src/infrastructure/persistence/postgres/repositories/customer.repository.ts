import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../../../domain/repositories/ICustomer.repository';
import { Customer, CreateCustomerData, UpdateCustomerData } from '../../../../domain/entities/customer.entity';
import { CustomerOrmEntity } from '../entities/customer.orm-entity';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerOrmEntity)
    private readonly customerRepository: Repository<CustomerOrmEntity>,
  ) {}

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.customerRepository.findOne({ where: { id } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findAll(): Promise<Customer[]> {
    const entities = await this.customerRepository.find();
    return entities.map(this.mapToDomain);
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    const entity = this.customerRepository.create({
      ...data,
      ...data.address,
    });
    const saved = await this.customerRepository.save(entity);
    return this.mapToDomain(saved);
  }

  async update(id: string, data: UpdateCustomerData): Promise<Customer> {
    await this.customerRepository.update(id, {
      ...data,
      ...data.address,
    });
    const updated = await this.customerRepository.findOne({ where: { id } });
    if (!updated) throw new Error('Customer not found');
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  private mapToDomain = (entity: CustomerOrmEntity): Customer => ({
    id: entity.id,
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: {
      street: entity.street,
      city: entity.city,
      state: entity.state,
      zipCode: entity.zipCode,
      country: entity.country,
    },
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  });
} 