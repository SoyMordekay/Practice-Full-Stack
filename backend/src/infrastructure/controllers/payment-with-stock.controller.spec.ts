import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PaymentWithStockController } from './payment-with-stock.controller';
import { ProcessPaymentWithStockUpdateUseCase } from '../../application/use-cases/process-payment-with-stock-update.usecase';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.usecase';

describe('PaymentWithStockController', () => {
  let app: INestApplication;
  const mockPaymentResult = {
    transaction: { id: 'txn-1', status: 'APPROVED' },
    paymentStatus: 'APPROVED',
    stockUpdated: true,
  };
  const mockUseCase = {
    execute: jest.fn().mockResolvedValue({ isSuccess: true, value: mockPaymentResult })
  };
  const mockStatusUseCase = {
    execute: jest.fn().mockImplementation((id) => id === '1' ? { isSuccess: true, value: mockPaymentResult } : { isSuccess: false, error: { message: 'not found' } })
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PaymentWithStockController],
      providers: [
        { provide: ProcessPaymentWithStockUpdateUseCase, useValue: mockUseCase },
        { provide: GetTransactionStatusUseCase, useValue: mockStatusUseCase },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /payment/process-with-stock', () => {
    return request(app.getHttpServer())
      .post('/payment/process-with-stock')
      .send({
        productId: '1',
        customerEmail: 'test@email.com',
        creditCardToken: 'tok_test',
        installments: 1,
        customerData: {
          name: 'Test',
          email: 'test@email.com',
          phone: '1234567890',
        },
        deliveryData: {
          address: 'Calle 1',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '12345',
          country: 'País',
          customerEmail: 'test@email.com',
        },
      })
      .expect(201)
      .expect({
        success: true,
        data: mockPaymentResult,
        message: 'Pago procesado exitosamente',
      });
  });

  it('GET /payment/status/:id (found)', () => {
    return request(app.getHttpServer())
      .get('/payment/status/1')
      .expect(200)
      .expect({
        success: true,
        data: mockPaymentResult,
        message: 'Pago procesado exitosamente',
      });
  });

  it('GET /payment/status/:id (not found)', () => {
    return request(app.getHttpServer())
      .get('/payment/status/999')
      .expect(404);
  });
}); 