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
exports.ProductRepositoryPg = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../../../../domain/entities/domain/entities/product.entity");
const product_orm_entity_1 = require("../entities/product.orm-entity");
let ProductRepositoryPg = class ProductRepositoryPg {
    typeOrmRepo;
    constructor(typeOrmRepo) {
        this.typeOrmRepo = typeOrmRepo;
    }
    toDomain(ormEntity) {
        if (!ormEntity)
            return null;
        const domainProduct = new product_entity_1.Product();
        Object.assign(domainProduct, ormEntity);
        return domainProduct;
    }
    async findById(id) {
        const ormProduct = await this.typeOrmRepo.findOneBy({ id });
        return this.toDomain(ormProduct);
    }
    async findAll() {
        const ormProducts = await this.typeOrmRepo.find();
        return ormProducts.map(p => this.toDomain(p)).filter(Boolean);
    }
    async decreaseStock(id, quantity) {
        const ormProduct = await this.typeOrmRepo.findOneBy({ id });
        if (!ormProduct)
            throw new common_1.NotFoundException(`Product with ID "${id}" not found`);
        const domainProduct = this.toDomain(ormProduct);
        domainProduct.decreaseStock(quantity);
        await this.typeOrmRepo.update(id, { stock: domainProduct.stock });
        return domainProduct;
    }
    async save(productData) {
        const ormEntity = this.typeOrmRepo.create(productData);
        const savedOrmEntity = await this.typeOrmRepo.save(ormEntity);
        return this.toDomain(savedOrmEntity);
    }
};
exports.ProductRepositoryPg = ProductRepositoryPg;
exports.ProductRepositoryPg = ProductRepositoryPg = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_orm_entity_1.ProductOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductRepositoryPg);
//# sourceMappingURL=product.repository.js.map