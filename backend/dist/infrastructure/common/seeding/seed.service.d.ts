import { OnModuleInit } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/IProduct.repository';
export declare class SeedService implements OnModuleInit {
    private readonly productRepo;
    private readonly logger;
    constructor(productRepo: IProductRepository);
    onModuleInit(): Promise<void>;
    private seedProducts;
}
