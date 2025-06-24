import { IProductRepository } from '../../../domain/repositories/IProduct.repository';
export declare class SeedService {
    private readonly productRepository;
    constructor(productRepository: IProductRepository);
    seedProducts(): Promise<void>;
}
