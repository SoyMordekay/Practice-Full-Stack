"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const IProduct_repository_1 = require("../../domain/repositories/IProduct.repository");
const product_repository_1 = require("../persistence/postgres/repositories/product.repository");
const product_orm_entity_1 = require("../persistence/postgres/entities/product.orm-entity");
const product_controller_1 = require("../controllers/product.controller");
const seed_service_1 = require("../common/seeding/seed.service");
let ProductModule = class ProductModule {
};
exports.ProductModule = ProductModule;
exports.ProductModule = ProductModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([product_orm_entity_1.ProductOrmEntity])],
        controllers: [product_controller_1.ProductController],
        providers: [
            seed_service_1.SeedService,
            {
                provide: IProduct_repository_1.IProductRepository,
                useClass: product_repository_1.ProductRepository,
            },
        ],
        exports: [IProduct_repository_1.IProductRepository],
    })
], ProductModule);
//# sourceMappingURL=product.module.js.map