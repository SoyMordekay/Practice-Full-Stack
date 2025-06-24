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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const process_payment_usecase_1 = require("../../application/use-cases/process-payment.usecase");
const get_transaction_status_usecase_1 = require("../../application/use-cases/get-transaction-status.usecase");
const create_payment_dto_1 = require("../../application/dtos/create-payment.dto");
let PaymentController = class PaymentController {
    processPaymentUseCase;
    getTransactionStatusUseCase;
    constructor(processPaymentUseCase, getTransactionStatusUseCase) {
        this.processPaymentUseCase = processPaymentUseCase;
        this.getTransactionStatusUseCase = getTransactionStatusUseCase;
    }
    async create(createPaymentDto) {
        const result = await this.processPaymentUseCase.execute(createPaymentDto);
        if (result.isSuccess) {
            return result.value;
        }
        else {
            throw new common_1.HttpException(result.error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getTransactionStatus(transactionId) {
        const result = await this.getTransactionStatusUseCase.execute({
            transactionId,
        });
        if (result.isSuccess) {
            return result.value;
        }
        else {
            throw new common_1.HttpException(result.error?.message ||
                'Error al consultar el estado de la transacción', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':transactionId/status'),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getTransactionStatus", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [process_payment_usecase_1.ProcessPaymentUseCase,
        get_transaction_status_usecase_1.GetTransactionStatusUseCase])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map