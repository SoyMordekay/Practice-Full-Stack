import { IProductRepository } from '../../domain/repositories/IProduct.repository';
export declare class ProductController {
    private readonly productRepo;
    constructor(productRepo: IProductRepository);
    findAll(): Promise<import("../../domain/entities/domain/entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("../../domain/entities/domain/entities/product.entity").Product | null>;
    create(createProductDto: any): Promise<import("../../domain/entities/domain/entities/product.entity").Product>;
}
