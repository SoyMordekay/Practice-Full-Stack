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
exports.ProcessPaymentUseCase = void 0;
const common_1 = require("@nestjs/common");
const ITransaction_repository_1 = require("../../domain/repositories/ITransaction.repository");
const IProduct_repository_1 = require("../../domain/repositories/IProduct.repository");
const IWompi_gateway_1 = require("../../domain/gateways/IWompi.gateway");
const uuid_1 = require("uuid");
let ProcessPaymentUseCase = class ProcessPaymentUseCase {
    transactionRepo;
    productRepo;
    wompiGateway;
    constructor(transactionRepo, productRepo, wompiGateway) {
        this.transactionRepo = transactionRepo;
        this.productRepo = productRepo;
        this.wompiGateway = wompiGateway;
    }
    async execute(dto) {
        const product = await this.productRepo.findById(dto.productId);
        if (!product)
            return { isSuccess: false, error: new Error('Product not found') };
        if (!product.hasStock(1))
            return { isSuccess: false, error: new Error('Insufficient stock') };
        const reference = (0, uuid_1.v4)();
        const transaction = await this.transactionRepo.create({
            productId: product.id,
            reference: reference,
            amountInCents: product.price * 100,
            status: 'PENDING',
            customerEmail: dto.customerEmail,
        });
        let wompiResponse;
        try {
            wompiResponse = await this.wompiGateway.createPayment({
                amountInCents: transaction.amountInCents,
                currency: 'COP',
                customerEmail: dto.customerEmail,
                reference: reference,
                paymentMethod: {
                    type: 'CARD',
                    token: dto.creditCardToken,
                    installments: dto.installments,
                },
            });
        }
        catch {
            await this.transactionRepo.updateStatus(transaction.id, 'DECLINED');
            return { isSuccess: false, error: new Error('Payment provider error') };
        }
        const finalStatus = wompiResponse.status === 'APPROVED' ? 'APPROVED' : 'DECLINED';
        const updatedTransaction = await this.transactionRepo.updateStatus(transaction.id, finalStatus);
        if (finalStatus === 'APPROVED') {
            await this.productRepo.decreaseStock(product.id, 1);
        }
        return { isSuccess: true, value: updatedTransaction };
    }
};
exports.ProcessPaymentUseCase = ProcessPaymentUseCase;
exports.ProcessPaymentUseCase = ProcessPaymentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(ITransaction_repository_1.ITransactionRepository)),
    __param(1, (0, common_1.Inject)(IProduct_repository_1.IProductRepository)),
    __param(2, (0, common_1.Inject)(IWompi_gateway_1.IWompiGateway)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ProcessPaymentUseCase);
//# sourceMappingURL=process-payment.usecase.js.map