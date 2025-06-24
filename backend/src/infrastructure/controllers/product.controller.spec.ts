import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProductController } from './product.controller';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';

describe('ProductController', () => {
  let app: INestApplication;
  const mockProduct = {
    id: '1',
    name: 'Test',
    description: 'Desc',
    price: 1000,
    stock: 10,
    imageUrl: 'http://img',
  };
  const mockProducts = [mockProduct];
  const mockRepo = {
    findAll: jest.fn().mockResolvedValue(mockProducts),
    findById: jest.fn().mockImplementation((id) => id === '1' ? mockProduct : null),
    create: jest.fn().mockResolvedValue(mockProduct),
    update: jest.fn().mockImplementation((id, data) => id === '1' ? mockProduct : null),
    delete: jest.fn().mockImplementation((id) => id === '1' ? mockProduct : null),
    save: jest.fn().mockResolvedValue(mockProduct),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: IProductRepository, useValue: mockRepo },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect(mockProducts);
  });

  it('GET /products/:id (found)', () => {
    return request(app.getHttpServer())
      .get('/products/1')
      .expect(200)
      .expect(mockProduct);
  });

  it('GET /products/:id (not found)', () => {
    return request(app.getHttpServer())
      .get('/products/999')
      .expect(200)
      .expect({});
  });

  it('POST /products', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Test',
        description: 'Desc',
        price: 1000,
        stock: 10,
        imageUrl: 'http://img',
      })
      .expect(201)
      .expect(mockProduct);
  });

  it('PUT /products/:id (found)', () => {
    return request(app.getHttpServer())
      .put('/products/1')
      .send({
        name: 'Updated',
        description: 'Desc2',
        price: 2000,
        stock: 5,
        imageUrl: 'http://img2',
      })
      .expect(200)
      .expect(mockProduct);
  });

  it('PUT /products/:id (not found)', () => {
    return request(app.getHttpServer())
      .put('/products/999')
      .send({
        name: 'Updated',
        description: 'Desc2',
        price: 2000,
        stock: 5,
        imageUrl: 'http://img2',
      })
      .expect(404);
  });

  it('DELETE /products/:id (found)', () => {
    return request(app.getHttpServer())
      .delete('/products/1')
      .expect(200)
      .expect(mockProduct);
  });

  it('DELETE /products/:id (not found)', () => {
    return request(app.getHttpServer())
      .delete('/products/999')
      .expect(404);
  });
}); 