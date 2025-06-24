import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CustomerController } from './customer.controller';
import { CreateCustomerUseCase } from '../../application/use-cases/customer/create-customer.usecase';
import { GetAllCustomersUseCase } from '../../application/use-cases/customer/get-all-customers.usecase';
import { GetCustomerByIdUseCase } from '../../application/use-cases/customer/get-customer-by-id.usecase';
import { UpdateCustomerUseCase } from '../../application/use-cases/customer/update-customer.usecase';
import { DeleteCustomerUseCase } from '../../application/use-cases/customer/delete-customer.usecase';

describe('CustomerController', () => {
  let app: INestApplication;
  const mockCustomer = {
    id: '1',
    name: 'Test',
    email: 'test@email.com',
    phone: '1234567890',
    address: {
      street: 'Calle 1',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
      country: 'País',
    },
  };
  const mockCustomers = [mockCustomer];

  const mockCreate = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockCustomer }) };
  const mockGetAll = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockCustomers }) };
  const mockGetById = { execute: jest.fn().mockImplementation(({ id }) => id === '1' ? { isSuccess: true, value: mockCustomer } : { isSuccess: false, error: { message: 'not found' } }) };
  const mockUpdate = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockCustomer }) };
  const mockDelete = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockCustomer }) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        { provide: CreateCustomerUseCase, useValue: mockCreate },
        { provide: GetAllCustomersUseCase, useValue: mockGetAll },
        { provide: GetCustomerByIdUseCase, useValue: mockGetById },
        { provide: UpdateCustomerUseCase, useValue: mockUpdate },
        { provide: DeleteCustomerUseCase, useValue: mockDelete },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /customers', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .expect(200)
      .expect(mockCustomers);
  });

  it('GET /customers/:id (found)', () => {
    return request(app.getHttpServer())
      .get('/customers/1')
      .expect(200)
      .expect(mockCustomer);
  });

  it('GET /customers/:id (not found)', () => {
    return request(app.getHttpServer())
      .get('/customers/999')
      .expect(404);
  });

  it('POST /customers', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .send({
        name: 'Test',
        email: 'test@email.com',
        phone: '1234567890',
        address: {
          street: 'Calle 1',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '12345',
          country: 'País',
        },
      })
      .expect(201)
      .expect(mockCustomer);
  });

  it('PUT /customers/:id', () => {
    return request(app.getHttpServer())
      .put('/customers/1')
      .send({
        name: 'Updated',
        email: 'updated@email.com',
        phone: '0987654321',
        address: {
          street: 'Calle 2',
          city: 'Ciudad2',
          state: 'Estado2',
          zipCode: '54321',
          country: 'País2',
        },
      })
      .expect(200)
      .expect(mockCustomer);
  });

  it('DELETE /customers/:id', () => {
    return request(app.getHttpServer())
      .delete('/customers/1')
      .expect(200)
      .expect(mockCustomer);
  });
}); 