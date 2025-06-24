import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WompiWebhookController } from './web-hook.controller';
import { ConfigService } from '@nestjs/config';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { WompiGateway } from '../gateways/wompi/wompi.gateway';

describe('WompiWebhookController', () => {
  let app: INestApplication;
  const mockConfig = { get: jest.fn().mockReturnValue('test_secret') };
  const mockTransactionRepo = { findByReference: jest.fn().mockResolvedValue({ id: '1', status: 'PENDING', productId: '1' }), updateStatus: jest.fn(), };
  const mockProductRepo = { decreaseStock: jest.fn() };
  const mockWompiGateway = {};

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WompiWebhookController],
      providers: [
        { provide: ConfigService, useValue: mockConfig },
        { provide: ITransactionRepository, useValue: mockTransactionRepo },
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: WompiGateway, useValue: mockWompiGateway },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /webhooks/wompi/events', () => {
    return request(app.getHttpServer())
      .post('/webhooks/wompi/events')
      .send({
        event: 'transaction.updated',
        data: { transaction: { id: '1', status: 'APPROVED', reference: 'ref', amount_in_cents: 1000, currency: 'COP' } },
        signature: { checksum: 'test', properties: [] },
        timestamp: Date.now(),
        sent_at: new Date().toISOString(),
      })
      .expect(400); // Firma inválida
  });
}); 