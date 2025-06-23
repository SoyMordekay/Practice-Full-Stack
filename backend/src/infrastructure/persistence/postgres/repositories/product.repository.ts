import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProductRepository } from '../../../../domain/repositories/IProduct.repository';
import { Product } from '../../../../domain/entities/domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';

@Injectable()
export class ProductRepositoryPg implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly typeOrmRepo: Repository<ProductOrmEntity>,
  ) {}

  private toDomain(ormEntity: ProductOrmEntity | null): Product | null {
    if (!ormEntity) return null;
    const domainProduct = new Product();
    Object.assign(domainProduct, ormEntity);
    return domainProduct;
  }

  async findById(id: string): Promise<Product | null> {
    const ormProduct = await this.typeOrmRepo.findOneBy({ id });
    return this.toDomain(ormProduct);
  }

  async findAll(): Promise<Product[]> {
    const ormProducts = await this.typeOrmRepo.find();
    return ormProducts.map(p => this.toDomain(p)).filter(Boolean) as Product[];
  }

  async decreaseStock(id: string, quantity: number): Promise<Product> {
    const ormProduct = await this.typeOrmRepo.findOneBy({ id });
    if (!ormProduct) throw new NotFoundException(`Product with ID "${id}" not found`);

    const domainProduct = this.toDomain(ormProduct) as Product;
    domainProduct.decreaseStock(quantity);
    await this.typeOrmRepo.update(id, { stock: domainProduct.stock });
    return domainProduct;
  }

  async save(productData: Partial<Product>): Promise<Product> {
    const ormEntity = this.typeOrmRepo.create(productData);
    const savedOrmEntity = await this.typeOrmRepo.save(ormEntity);
    return this.toDomain(savedOrmEntity) as Product;
  }
}