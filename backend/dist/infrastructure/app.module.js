"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const payment_module_1 = require("./payment/payment.module");
const product_module_1 = require("./product/product.module");
const customer_module_1 = require("./customer/customer.module");
const delivery_module_1 = require("./delivery/delivery.module");
const seed_controller_1 = require("./common/seeding/seed.controller");
const seed_service_1 = require("./common/seeding/seed.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                autoLoadEntities: true,
                synchronize: true,
            }),
            payment_module_1.PaymentModule,
            product_module_1.ProductModule,
            customer_module_1.CustomerModule,
            delivery_module_1.DeliveryModule,
        ],
        controllers: [seed_controller_1.SeedController],
        providers: [seed_service_1.SeedService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map