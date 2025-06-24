"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const payment_controller_1 = require("../controllers/payment.controller");
const process_payment_usecase_1 = require("../../application/use-cases/process-payment.usecase");
const get_transaction_status_usecase_1 = require("../../application/use-cases/get-transaction-status.usecase");
const ITransaction_repository_1 = require("../../domain/repositories/ITransaction.repository");
const IWompi_gateway_1 = require("../../domain/gateways/IWompi.gateway");
const transaction_repository_1 = require("../persistence/postgres/repositories/transaction.repository");
const wompi_gateway_1 = require("../gateways/wompi/wompi.gateway");
const transaction_orm_entity_1 = require("../persistence/postgres/entities/transaction.orm-entity");
const product_module_1 = require("../product/product.module");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([transaction_orm_entity_1.TransactionOrmEntity]),
            product_module_1.ProductModule,
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [
            process_payment_usecase_1.ProcessPaymentUseCase,
            get_transaction_status_usecase_1.GetTransactionStatusUseCase,
            { provide: ITransaction_repository_1.ITransactionRepository, useClass: transaction_repository_1.TransactionRepositoryPg },
            { provide: IWompi_gateway_1.IWompiGateway, useClass: wompi_gateway_1.WompiGateway },
        ],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map