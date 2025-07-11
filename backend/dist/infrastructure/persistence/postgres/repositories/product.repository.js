"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_orm_entity_1 = require("../entities/product.orm-entity");
let ProductRepository = class ProductRepository {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async findAll() {
        const products = await this.productRepository.find();
        return products.map(this.mapToDomain);
    }
    async findById(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        return product ? this.mapToDomain(product) : null;
    }
    async decreaseStock(productId, quantity) {
        await this.productRepository
            .createQueryBuilder()
            .update(product_orm_entity_1.ProductOrmEntity)
            .set({ stock: () => `stock - ${quantity}` })
            .where('id = :id', { id: productId })
            .execute();
        const updatedProduct = await this.productRepository.findOne({
            where: { id: productId },
        });
        if (!updatedProduct) {
            throw new Error(`Product with ID "${productId}" not found`);
        }
        if (updatedProduct.stock < 0) {
            throw new Error(`Insufficient stock for product "${updatedProduct.name}"`);
        }
        return this.mapToDomain(updatedProduct);
    }
    async save(product) {
        const ormEntity = this.productRepository.create(product);
        const savedOrmEntity = await this.productRepository.save(ormEntity);
        return this.mapToDomain(savedOrmEntity);
    }
    mapToDomain = (ormEntity) => {
        return {
            id: ormEntity.id,
            name: ormEntity.name,
            description: ormEntity.description,
            price: ormEntity.price,
            stock: ormEntity.stock,
            imageUrl: ormEntity.imageUrl,
            hasStock: (quantity) => ormEntity.stock >= quantity,
            decreaseStock: (qty) => {
                void this.decreaseStock(ormEntity.id, qty);
            },
        };
    };
};
exports.ProductRepository = ProductRepository;
exports.ProductRepository = ProductRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_orm_entity_1.ProductOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductRepository);
//# sourceMappingURL=product.repository.js.map