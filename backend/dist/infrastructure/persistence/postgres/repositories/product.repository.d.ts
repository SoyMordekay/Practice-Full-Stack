import { Repository } from 'typeorm';
import { IProductRepository } from '../../../../domain/repositories/IProduct.repository';
import { Product } from '../../../../domain/entities/domain/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
export declare class ProductRepository implements IProductRepository {
    private readonly productRepository;
    constructor(productRepository: Repository<ProductOrmEntity>);
    findAll(): Promise<Product[]>;
    findById(id: string): Promise<Product | null>;
    decreaseStock(productId: string, quantity: number): Promise<Product>;
    save(product: Partial<Product>): Promise<Product>;
    private mapToDomain;
}
