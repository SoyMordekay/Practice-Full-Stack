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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const IProduct_repository_1 = require("../../../domain/repositories/IProduct.repository");
let SeedService = class SeedService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async seedProducts() {
        const products = [
            {
                name: 'Laptop Gaming',
                description: 'Potente laptop para gaming con gráficos dedicados',
                price: 2500000,
                stock: 10,
                imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
            },
            {
                name: 'Smartphone Pro',
                description: 'Smartphone de última generación con cámara profesional',
                price: 1200000,
                stock: 15,
                imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
            },
            {
                name: 'Auriculares Wireless',
                description: 'Auriculares bluetooth con cancelación de ruido',
                price: 350000,
                stock: 25,
                imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            },
            {
                name: 'Tablet Ultra',
                description: 'Tablet premium con pantalla de alta resolución',
                price: 1800000,
                stock: 8,
                imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
            },
            {
                name: 'Smartwatch Sport',
                description: 'Reloj inteligente con GPS y monitoreo de salud',
                price: 450000,
                stock: 20,
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            },
        ];
        for (const productData of products) {
            await this.productRepository.save(productData);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(IProduct_repository_1.IProductRepository)),
    __metadata("design:paramtypes", [Object])
], SeedService);
//# sourceMappingURL=seed.service.js.map