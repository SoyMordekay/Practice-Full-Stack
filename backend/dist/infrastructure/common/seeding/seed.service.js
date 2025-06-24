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
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const IProduct_repository_1 = require("../../../domain/repositories/IProduct.repository");
let SeedService = SeedService_1 = class SeedService {
    productRepo;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async onModuleInit() {
        await this.seedProducts();
    }
    async seedProducts() {
        const products = await this.productRepo.findAll();
        if (products.length > 0) {
            this.logger.log('Database already seeded with products. Skipping.');
            return;
        }
        this.logger.log('Seeding products...');
        const productsToCreate = [
            {
                name: 'T-Shirt "Code Life"',
                description: 'La camiseta perfecta para largas noches de codificación.',
                price: 25000,
                stock: 50,
                imageUrl: 'https://cdn.awsli.com.br/300x300/608/608801/produto/153700346/b06af391c1.jpg',
            },
            {
                name: 'Taza "Hello World"',
                description: 'Empieza tu día con el clásico saludo de todo programador.',
                price: 15000,
                stock: 100,
                imageUrl: 'https://http2.mlstatic.com/D_NQ_NP_803078-MLU76019047524_052024-O.webp',
            },
        ];
        for (const product of productsToCreate) {
            await this.productRepo.save(product);
        }
        this.logger.log('Seeding completed.');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(IProduct_repository_1.IProductRepository)),
    __metadata("design:paramtypes", [Object])
], SeedService);
//# sourceMappingURL=seed.service.js.map