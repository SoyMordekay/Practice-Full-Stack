import { Product } from '../entities/domain/entities/product.entity';
export declare const IProductRepository: unique symbol;
export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    decreaseStock(id: string, quantity: number): Promise<Product>;
    save(product: Partial<Product>): Promise<Product>;
}
