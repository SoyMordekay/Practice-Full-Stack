import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ProductRepositoryPg } from './product.repository';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { Product } from '../../../../domain/entities/domain/entities/product.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductRepositoryPg (Integration)', () => {
  let repository: ProductRepositoryPg;
  let typeOrmRepo: Repository<ProductOrmEntity>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'test_db',
          entities: [ProductOrmEntity],
          synchronize: true, // Solo para testing
          logging: false,
        }),
        TypeOrmModule.forFeature([ProductOrmEntity]),
      ],
      providers: [ProductRepositoryPg],
    }).compile();

    repository = module.get<ProductRepositoryPg>(ProductRepositoryPg);
    typeOrmRepo = module.get<Repository<ProductOrmEntity>>(getRepositoryToken(ProductOrmEntity));
  });

  beforeEach(async () => {
    // Limpiar la tabla antes de cada prueba
    await typeOrmRepo.clear();
  });

  afterAll(async () => {
    // Limpiar después de todas las pruebas
    await typeOrmRepo.clear();
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        stock: 10,
        imageUrl: 'http://example.com/image.png',
      };
      await typeOrmRepo.save(productData);

      // Act
      const product = await repository.findById('a3e1b2c4-1234-5678-9abc-def012345678');

      // Assert
      expect(product).toBeDefined();
      expect(product?.id).toBe('a3e1b2c4-1234-5678-9abc-def012345678');
      expect(product?.name).toBe('Test Product');
      expect(product?.price).toBe(1000);
      expect(product?.stock).toBe(10);
    });

    it('should return null if product not found', async () => {
      // Act
      const product = await repository.findById('b4f2c3d5-2345-6789-abcd-ef1234567890');

      // Assert
      expect(product).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      // Arrange
      const productsData = [
        {
          id: 'a3e1b2c4-1234-5678-9abc-def012345678',
          name: 'Product 1',
          description: 'Desc 1',
          price: 100,
          stock: 5,
          imageUrl: 'img1',
        },
        {
          id: 'b4f2c3d5-2345-6789-abcd-ef1234567890',
          name: 'Product 2',
          description: 'Desc 2',
          price: 200,
          stock: 10,
          imageUrl: 'img2',
        },
      ];
      await typeOrmRepo.save(productsData);

      // Act
      const products = await repository.findAll();

      // Assert
      expect(products).toHaveLength(2);
      expect(products[0].id).toBe('a3e1b2c4-1234-5678-9abc-def012345678');
      expect(products[1].id).toBe('b4f2c3d5-2345-6789-abcd-ef1234567890');
    });

    it('should return empty array when no products exist', async () => {
      // Act
      const products = await repository.findAll();

      // Assert
      expect(products).toHaveLength(0);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock successfully', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        stock: 10,
        imageUrl: 'http://example.com/image.png',
      };
      await typeOrmRepo.save(productData);

      // Act
      const updatedProduct = await repository.decreaseStock('a3e1b2c4-1234-5678-9abc-def012345678', 3);

      // Assert
      expect(updatedProduct.stock).toBe(7);
      
      // Verify in database
      const dbProduct = await typeOrmRepo.findOneBy({ id: 'a3e1b2c4-1234-5678-9abc-def012345678' });
      expect(dbProduct?.stock).toBe(7);
    });

    it('should throw error if product not found', async () => {
      // Act & Assert
      await expect(repository.decreaseStock('b4f2c3d5-2345-6789-abcd-ef1234567890', 1))
        .rejects.toThrow('Product with ID "b4f2c3d5-2345-6789-abcd-ef1234567890" not found');
    });

    it('should throw error if insufficient stock', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        stock: 2,
        imageUrl: 'http://example.com/image.png',
      };
      await typeOrmRepo.save(productData);

      // Act & Assert
      await expect(repository.decreaseStock('a3e1b2c4-1234-5678-9abc-def012345678', 5))
        .rejects.toThrow('Insufficient stock for product "Test Product"');
    });

    it('should decrease stock to zero', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Test Product',
        description: 'Test Description',
        price: 1000,
        stock: 3,
        imageUrl: 'http://example.com/image.png',
      };
      await typeOrmRepo.save(productData);

      // Act
      const updatedProduct = await repository.decreaseStock('a3e1b2c4-1234-5678-9abc-def012345678', 3);

      // Assert
      expect(updatedProduct.stock).toBe(0);
    });
  });

  describe('save', () => {
    it('should create a new product', async () => {
      // Arrange
      const productData: Partial<Product> = {
        name: 'New Product',
        description: 'New Description',
        price: 1500,
        stock: 20,
        imageUrl: 'http://example.com/new-image.png',
      };

      // Act
      const savedProduct = await repository.save(productData);

      // Assert
      expect(savedProduct.id).toBeDefined();
      expect(savedProduct.name).toBe('New Product');
      expect(savedProduct.price).toBe(1500);
      expect(savedProduct.stock).toBe(20);

      // Verify in database
      const dbProduct = await typeOrmRepo.findOneBy({ id: savedProduct.id });
      expect(dbProduct).toBeDefined();
      expect(dbProduct?.name).toBe('New Product');
    });

    it('should update an existing product', async () => {
      // Arrange
      const existingProduct = await typeOrmRepo.save({
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Original Name',
        description: 'Original Description',
        price: 1000,
        stock: 10,
        imageUrl: 'http://example.com/image.png',
      });

      const updateData: Partial<Product> = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Updated Name',
        price: 2000,
        stock: 15,
      };

      // Act
      const updatedProduct = await repository.save(updateData);

      // Assert
      expect(updatedProduct.id).toBe('a3e1b2c4-1234-5678-9abc-def012345678');
      expect(updatedProduct.name).toBe('Updated Name');
      expect(updatedProduct.price).toBe(2000);
      expect(updatedProduct.stock).toBe(15);

      // Verify in database
      const dbProduct = await typeOrmRepo.findOneBy({ id: 'a3e1b2c4-1234-5678-9abc-def012345678' });
      expect(dbProduct?.name).toBe('Updated Name');
      expect(dbProduct?.price).toBe(2000);
    });
  });

  describe('edge cases', () => {
    it('should handle product with zero price', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Free Product',
        description: 'Free Description',
        price: 0,
        stock: 100,
        imageUrl: 'http://example.com/free.png',
      };
      await typeOrmRepo.save(productData);

      // Act
      const product = await repository.findById('a3e1b2c4-1234-5678-9abc-def012345678');

      // Assert
      expect(product?.price).toBe(0);
    });

    it('should handle product with zero stock', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Out of Stock Product',
        description: 'Out of Stock Description',
        price: 1000,
        stock: 0,
        imageUrl: 'http://example.com/out-of-stock.png',
      };
      await typeOrmRepo.save(productData);

      // Act
      const product = await repository.findById('a3e1b2c4-1234-5678-9abc-def012345678');

      // Assert
      expect(product?.stock).toBe(0);
      expect(product?.hasStock(1)).toBe(false);
    });

    it('should handle product with special characters in name', async () => {
      // Arrange
      const productData = {
        id: 'a3e1b2c4-1234-5678-9abc-def012345678',
        name: 'Product with special chars: !@#$%^&*()',
        description: 'Special Description',
        price: 1000,
        stock: 10,
        imageUrl: 'http://example.com/special.png',
      };
      await typeOrmRepo.save(productData);

      // Act
      const product = await repository.findById('a3e1b2c4-1234-5678-9abc-def012345678');

      // Assert
      expect(product?.name).toBe('Product with special chars: !@#$%^&*()');
    });
  });
}); 