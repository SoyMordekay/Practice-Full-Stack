import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../../../domain/repositories/IProduct.repository';
import { Product } from '../../../../domain/entities/domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly productRepository: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const products = await this.productRepository.find();
    return products.map(this.mapToDomain);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.productRepository.findOne({ where: { id } });
    return product ? this.mapToDomain(product) : null;
  }

  async decreaseStock(productId: string, quantity: number): Promise<Product> {
    await this.productRepository
      .createQueryBuilder()
      .update(ProductOrmEntity)
      .set({ stock: () => `stock - ${quantity}` })
      .where('id = :id', { id: productId })
      .execute();

    const updatedProduct = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!updatedProduct) {
      throw new Error(`Product with ID "${productId}" not found`);
    }

    return this.mapToDomain(updatedProduct);
  }

  async save(product: Partial<Product>): Promise<Product> {
    const ormEntity = this.productRepository.create(product);
    const savedOrmEntity = await this.productRepository.save(ormEntity);
    return this.mapToDomain(savedOrmEntity);
  }

  private mapToDomain = (ormEntity: ProductOrmEntity): Product => {
    return {
      id: ormEntity.id,
      name: ormEntity.name,
      description: ormEntity.description,
      price: ormEntity.price,
      stock: ormEntity.stock,
      imageUrl: ormEntity.imageUrl,
      hasStock: (quantity: number) => ormEntity.stock >= quantity,
      decreaseStock: (qty: number) => {
        void this.decreaseStock(ormEntity.id, qty);
      },
    };
  };
}
