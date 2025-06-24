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
var WompiWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WompiWebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const ITransaction_repository_1 = require("../../domain/repositories/ITransaction.repository");
const IProduct_repository_1 = require("../../domain/repositories/IProduct.repository");
const common_2 = require("@nestjs/common");
const wompi_gateway_1 = require("../gateways/wompi/wompi.gateway");
let WompiWebhookController = WompiWebhookController_1 = class WompiWebhookController {
    configService;
    transactionRepo;
    productRepo;
    wompiGateway;
    logger = new common_1.Logger(WompiWebhookController_1.name);
    WOMPI_EVENTS_SECRET;
    constructor(configService, transactionRepo, productRepo, wompiGateway) {
        this.configService = configService;
        this.transactionRepo = transactionRepo;
        this.productRepo = productRepo;
        this.wompiGateway = wompiGateway;
        this.WOMPI_EVENTS_SECRET =
            this.configService.get('WOMPI_EVENTS_SECRET') ?? '';
        if (!this.WOMPI_EVENTS_SECRET) {
            this.logger.error('WOMPI_EVENTS_SECRET no está configurado en .env. La validación de webhooks fallará.');
        }
    }
    isValidSignature(payloadTimestamp, transactionId, transactionStatus, transactionAmountInCents, receivedSignature) {
        if (!this.WOMPI_EVENTS_SECRET) {
            this.logger.warn('No se puede validar la firma del webhook: WOMPI_EVENTS_SECRET no configurado.');
            return false;
        }
        const stringToSign = `${transactionId}${transactionStatus}${transactionAmountInCents}${payloadTimestamp}${this.WOMPI_EVENTS_SECRET}`;
        const calculatedSignature = crypto
            .createHash('sha256')
            .update(stringToSign, 'utf8')
            .digest('hex');
        this.logger.debug(`Validating webhook signature:
      String to sign: "${stringToSign}"
      Calculated signature: "${calculatedSignature}"
      Received signature: "${receivedSignature}"`);
        return calculatedSignature === receivedSignature;
    }
    async handleWompiEvent(payload) {
        this.logger.log(`Webhook recibido de Wompi: ${payload.event}`);
        this.logger.debug('Payload completo del webhook:', JSON.stringify(payload, null, 2));
        const transactionData = payload.data?.transaction;
        if (!transactionData || !payload.signature || !payload.timestamp) {
            this.logger.error('Payload de webhook inválido o incompleto.');
            throw new common_1.BadRequestException('Payload de webhook inválido.');
        }
        const isValid = this.isValidSignature(payload.timestamp, transactionData.id, transactionData.status, transactionData.amount_in_cents, payload.signature.checksum);
        if (!isValid) {
            this.logger.warn(`Firma de webhook inválida para la transacción de Wompi ID: ${transactionData.id}`);
            throw new common_1.BadRequestException('Firma de webhook inválida.');
        }
        this.logger.log(`Firma de webhook válida para Wompi TX ID: ${transactionData.id}. Procesando evento...`);
        const localTransaction = await this.transactionRepo.findByReference(transactionData.reference);
        if (!localTransaction) {
            this.logger.warn(`No se encontró transacción local con referencia: ${transactionData.reference}`);
            return {
                message: 'Evento recibido, pero no se encontró transacción local correspondiente.',
            };
        }
        if (localTransaction.status !== transactionData.status) {
            this.logger.log(`Actualizando estado de transacción local ${localTransaction.id} de ${localTransaction.status} a ${transactionData.status}`);
            await this.transactionRepo.updateStatus(localTransaction.id, transactionData.status);
        }
        if (transactionData.status === 'APPROVED' &&
            localTransaction.status !== 'APPROVED') {
            this.logger.log(`Transacción ${transactionData.id} APROBADA. Actualizando stock para producto ID: ${localTransaction.productId}`);
            try {
                await this.productRepo.decreaseStock(localTransaction.productId, 1);
                this.logger.log(`Stock actualizado para producto ID: ${localTransaction.productId}`);
            }
            catch (stockError) {
                this.logger.error(`Error al actualizar stock para producto ID ${localTransaction.productId} después de pago aprobado:`, stockError);
            }
        }
        this.logger.log(`Webhook para transacción de Wompi ID ${transactionData.id} procesado con éxito.`);
        return { message: 'Evento de webhook procesado con éxito.' };
    }
    async handleWebhook(payload, signature, timestamp) {
        try {
            const event = await this.wompiGateway.processWebhookEvent(JSON.stringify(payload), signature, timestamp);
            return { success: true, event: event.event };
        }
        catch {
            throw new common_1.HttpException('Invalid webhook signature', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.WompiWebhookController = WompiWebhookController;
__decorate([
    (0, common_1.Post)('events'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WompiWebhookController.prototype, "handleWompiEvent", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('wompi-signature')),
    __param(2, (0, common_1.Headers)('wompi-timestamp')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WompiWebhookController.prototype, "handleWebhook", null);
exports.WompiWebhookController = WompiWebhookController = WompiWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/wompi'),
    __param(1, (0, common_2.Inject)(ITransaction_repository_1.ITransactionRepository)),
    __param(2, (0, common_2.Inject)(IProduct_repository_1.IProductRepository)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object, Object, wompi_gateway_1.WompiGateway])
], WompiWebhookController);
//# sourceMappingURL=web-hook.controller.js.map