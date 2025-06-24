import { Customer, CreateCustomerData, UpdateCustomerData } from '../entities/customer.entity';

export const ICustomerRepository = Symbol('ICustomerRepository');

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  create(data: CreateCustomerData): Promise<Customer>;
  update(id: string, data: UpdateCustomerData): Promise<Customer>;
  delete(id: string): Promise<void>;
} 