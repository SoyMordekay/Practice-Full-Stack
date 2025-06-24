import { IProductRepository } from '../../domain/repositories/IProduct.repository';
export declare class ProductController {
    private readonly productRepo;
    constructor(productRepo: IProductRepository);
    findAll(): Promise<import("../../domain/entities/domain/entities/product.entity").Product[]>;
}
