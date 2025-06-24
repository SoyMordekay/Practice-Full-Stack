import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DeliveryController } from './delivery.controller';
import { CreateDeliveryUseCase } from '../../application/use-cases/delivery/create-delivery.usecase';
import { GetAllDeliveriesUseCase } from '../../application/use-cases/delivery/get-all-deliveries.usecase';
import { GetDeliveryByIdUseCase } from '../../application/use-cases/delivery/get-delivery-by-id.usecase';
import { UpdateDeliveryUseCase } from '../../application/use-cases/delivery/update-delivery.usecase';
import { DeleteDeliveryUseCase } from '../../application/use-cases/delivery/delete-delivery.usecase';

describe('DeliveryController', () => {
  let app: INestApplication;
  const mockDelivery = {
    id: '1',
    transactionId: 'txn-1',
    customerId: 'cust-1',
    status: 'PENDING',
    estimatedDeliveryDate: new Date().toISOString(),
    address: {
      street: 'Calle 1',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '12345',
      country: 'País',
    },
  };
  const mockDeliveries = [mockDelivery];

  const mockCreate = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockDelivery }) };
  const mockGetAll = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockDeliveries }) };
  const mockGetById = { execute: jest.fn().mockImplementation(({ id }) => id === '1' ? { isSuccess: true, value: mockDelivery } : { isSuccess: false, error: { message: 'not found' } }) };
  const mockUpdate = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockDelivery }) };
  const mockDelete = { execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockDelivery }) };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryController],
      providers: [
        { provide: CreateDeliveryUseCase, useValue: mockCreate },
        { provide: GetAllDeliveriesUseCase, useValue: mockGetAll },
        { provide: GetDeliveryByIdUseCase, useValue: mockGetById },
        { provide: UpdateDeliveryUseCase, useValue: mockUpdate },
        { provide: DeleteDeliveryUseCase, useValue: mockDelete },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /deliveries', () => {
    return request(app.getHttpServer())
      .get('/deliveries')
      .expect(200)
      .expect(mockDeliveries);
  });

  it('GET /deliveries/:id (found)', () => {
    return request(app.getHttpServer())
      .get('/deliveries/1')
      .expect(200)
      .expect(mockDelivery);
  });

  it('GET /deliveries/:id (not found)', () => {
    return request(app.getHttpServer())
      .get('/deliveries/999')
      .expect(404);
  });

  it('POST /deliveries', () => {
    return request(app.getHttpServer())
      .post('/deliveries')
      .send({
        transactionId: 'txn-1',
        customerId: 'cust-1',
        status: 'PENDING',
        estimatedDeliveryDate: new Date().toISOString(),
        address: {
          street: 'Calle 1',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '12345',
          country: 'País',
        },
      })
      .expect(201)
      .expect(mockDelivery);
  });

  it('PUT /deliveries/:id', () => {
    return request(app.getHttpServer())
      .put('/deliveries/1')
      .send({
        transactionId: 'txn-1',
        customerId: 'cust-1',
        status: 'IN_TRANSIT',
        estimatedDeliveryDate: new Date().toISOString(),
        address: {
          street: 'Calle 2',
          city: 'Ciudad2',
          state: 'Estado2',
          zipCode: '54321',
          country: 'País2',
        },
      })
      .expect(200)
      .expect(mockDelivery);
  });

  it('DELETE /deliveries/:id', () => {
    return request(app.getHttpServer())
      .delete('/deliveries/1')
      .expect(200)
      .expect(mockDelivery);
  });
}); 