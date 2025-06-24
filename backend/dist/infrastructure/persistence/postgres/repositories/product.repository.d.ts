import { Repository } from 'typeorm';
import { IProductRepository } from '../../../../domain/repositories/IProduct.repository';
import { Product } from '../../../../domain/entities/domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
export declare class ProductRepositoryPg implements IProductRepository {
    private readonly typeOrmRepo;
    constructor(typeOrmRepo: Repository<ProductOrmEntity>);
    private toDomain;
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    decreaseStock(id: string, quantity: number): Promise<Product>;
    save(productData: Partial<Product>): Promise<Product>;
}
