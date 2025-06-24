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
var WompiGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WompiGateway = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto = require("crypto");
const axios_2 = require("axios");
let WompiGateway = WompiGateway_1 = class WompiGateway {
    configService;
    httpService;
    logger = new common_1.Logger(WompiGateway_1.name);
    WOMPI_API_BASE_URL;
    WOMPI_PRIVATE_KEY;
    WOMPI_PUBLIC_KEY;
    WOMPI_INTEGRITY_KEY;
    WOMPI_EVENTS_SECRET;
    acceptanceToken = '';
    axiosInstance;
    TEST_CARDS = {
        approved: '4242424242424242',
        declined: '4000000000000002',
        pending: '4000000000000069',
        insufficient: '4000000000000119',
        fraud: '4100000000000019',
    };
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.WOMPI_API_BASE_URL =
            this.configService.get('WOMPI_API_BASE_URL') ?? '';
        this.WOMPI_PRIVATE_KEY =
            this.configService.get('WOMPI_PRIVATE_KEY') ?? '';
        this.WOMPI_PUBLIC_KEY =
            this.configService.get('WOMPI_PUBLIC_KEY') ?? '';
        this.WOMPI_INTEGRITY_KEY =
            this.configService.get('WOMPI_INTEGRITY_KEY') ?? '';
        this.WOMPI_EVENTS_SECRET =
            this.configService.get('WOMPI_EVENTS_SECRET') ?? '';
        this.axiosInstance = axios_2.default.create({
            baseURL: this.WOMPI_API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.WOMPI_PRIVATE_KEY}`,
            },
        });
        this.logger.log('Wompi Config Loaded for Gateway:', {
            apiBaseUrl: this.WOMPI_API_BASE_URL,
            hasPrivateKey: !!this.WOMPI_PRIVATE_KEY,
            hasPublicKey: !!this.WOMPI_PUBLIC_KEY,
            hasIntegrityKey: !!this.WOMPI_INTEGRITY_KEY,
            hasEventsSecret: !!this.WOMPI_EVENTS_SECRET,
        });
    }
    async getAcceptanceToken() {
        if (this.acceptanceToken) {
            return this.acceptanceToken;
        }
        try {
            const url = `${this.WOMPI_API_BASE_URL}/merchants/${this.WOMPI_PUBLIC_KEY}`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            const presignedAcceptance = response.data.data.presigned_acceptance;
            if (!presignedAcceptance || !presignedAcceptance.acceptance_token) {
                throw new Error('No se pudo obtener el acceptance token de Wompi');
            }
            this.acceptanceToken = presignedAcceptance.acceptance_token;
            this.logger.log('Acceptance token obtenido exitosamente');
            return this.acceptanceToken;
        }
        catch (error) {
            this.logger.error('Error obteniendo acceptance token:', error.response?.data || error.message);
            throw new Error('No se pudo obtener el acceptance token de Wompi');
        }
    }
    generateIntegritySignature(reference, amountInCents, currency) {
        const message = `${reference}${amountInCents}${currency}${this.WOMPI_INTEGRITY_KEY}`;
        const hash = crypto
            .createHash('sha256')
            .update(message, 'utf8')
            .digest('hex');
        this.logger.log(`Signature: Generated for ref ${reference} -> hash: ${hash}`);
        this.logger.debug(`Signature message: "${message}"`);
        return hash;
    }
    async createPayment(data) {
        const url = `${this.WOMPI_API_BASE_URL}/transactions`;
        const acceptanceToken = await this.getAcceptanceToken();
        const headers = {
            Authorization: `Bearer ${this.WOMPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json',
        };
        const signature = this.generateIntegritySignature(data.reference, data.amountInCents, data.currency);
        const wompiPayload = {
            acceptance_token: acceptanceToken,
            amount_in_cents: data.amountInCents,
            currency: data.currency,
            customer_email: data.customerEmail,
            payment_method: {
                type: data.paymentMethod.type,
                token: data.paymentMethod.token,
                installments: data.paymentMethod.installments,
            },
            reference: data.reference,
            signature: signature,
        };
        this.logger.log('Calling Wompi (/transactions) with payload:', {
            ...wompiPayload,
            signature: signature.substring(0, 10) + '...',
        });
        try {
            const wompiResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, wompiPayload, { headers }));
            this.logger.log('Wompi API call successful:', {
                id: wompiResponse.data.data.id,
                status: wompiResponse.data.data.status,
                reference: wompiResponse.data.data.reference,
            });
            return wompiResponse.data.data;
        }
        catch (error) {
            this.logger.error('Error from Wompi API (/transactions):', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
            });
            const errorMessage = error.response?.data?.error?.messages
                ? JSON.stringify(error.response.data.error.messages)
                : error.message;
            throw new Error(`Error en Wompi API: ${errorMessage}`);
        }
    }
    async getTransactionStatus(transactionId) {
        try {
            const url = `${this.WOMPI_API_BASE_URL}/transactions/${transactionId}`;
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Error consultando el estado de la transacción:', error.response?.data || error.message);
            throw new Error('No se pudo consultar el estado de la transacción en Wompi');
        }
    }
    validateWebhookSignature(payload, signature, timestamp) {
        try {
            const message = `${timestamp}.${payload}`;
            const expectedSignature = crypto
                .createHmac('sha256', this.WOMPI_EVENTS_SECRET)
                .update(message, 'utf8')
                .digest('hex');
            const isValid = crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
            this.logger.debug(`Webhook signature validation: ${isValid ? 'VALID' : 'INVALID'}`);
            return isValid;
        }
        catch (error) {
            this.logger.error('Error validating webhook signature:', error);
            return false;
        }
    }
    async processWebhookEvent(payload, signature, timestamp) {
        if (!this.validateWebhookSignature(payload, signature, timestamp)) {
            throw new Error('Invalid webhook signature');
        }
        try {
            const event = JSON.parse(payload);
            this.logger.log('Processing webhook event:', {
                event: event.event,
                transactionId: event.data.transaction.id,
                status: event.data.transaction.status,
                reference: event.data.transaction.reference,
            });
            switch (event.event) {
                case 'transaction.updated':
                    await this.handleTransactionUpdated(event.data.transaction);
                    break;
                case 'transaction.created':
                    await this.handleTransactionCreated(event.data.transaction);
                    break;
                default:
                    this.logger.warn(`Unhandled webhook event: ${event.event}`);
            }
            return event;
        }
        catch (error) {
            this.logger.error('Error processing webhook event:', error);
            throw new Error('Failed to process webhook event');
        }
    }
    async handleTransactionUpdated(transaction) {
        this.logger.log(`Transaction updated: ${transaction.id} -> ${transaction.status}`);
        switch (transaction.status) {
            case 'APPROVED':
                this.logger.log(`Payment approved for reference: ${transaction.reference}`);
                break;
            case 'DECLINED':
                this.logger.log(`Payment declined for reference: ${transaction.reference}`);
                break;
            case 'PENDING':
                this.logger.log(`Payment pending for reference: ${transaction.reference}`);
                break;
            case 'ERROR':
                this.logger.error(`Payment error for reference: ${transaction.reference}`);
                break;
        }
    }
    async handleTransactionCreated(transaction) {
        this.logger.log(`Transaction created: ${transaction.id} with status ${transaction.status}`);
    }
    async generateTestCardToken(cardNumber, testScenario) {
        const url = `${this.WOMPI_API_BASE_URL}/tokens/cards`;
        const headers = {
            Authorization: `Bearer ${this.WOMPI_PUBLIC_KEY}`,
            'Content-Type': 'application/json',
        };
        const finalCardNumber = testScenario
            ? this.TEST_CARDS[testScenario]
            : cardNumber;
        const payload = {
            number: finalCardNumber,
            cvc: '123',
            exp_month: '12',
            exp_year: '2025',
            card_holder: 'Test User',
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
                headers,
            }));
            this.logger.log(`Test card token generated for scenario: ${testScenario || 'custom'}`, {
                tokenId: response.data.data.id,
                cardNumber: finalCardNumber.replace(/\d(?=\d{4})/g, '*'),
            });
            return response.data.data.id;
        }
        catch (error) {
            this.logger.error('Error generating test card token:', error.response?.data);
            throw new Error('Failed to generate test card token');
        }
    }
    clearAcceptanceTokenCache() {
        this.acceptanceToken = '';
        this.logger.log('Acceptance token cache cleared');
    }
    getTestingInfo() {
        return {
            testCards: this.TEST_CARDS,
            expectedOutcomes: {
                approved: 'APPROVED - Pago aprobado exitosamente',
                declined: 'DECLINED - Pago rechazado',
                pending: 'PENDING - Pago pendiente de confirmación',
                insufficient: 'DECLINED - Fondos insuficientes',
                fraud: 'DECLINED - Transacción fraudulenta',
            },
        };
    }
};
exports.WompiGateway = WompiGateway;
exports.WompiGateway = WompiGateway = WompiGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], WompiGateway);
//# sourceMappingURL=wompi.gateway.js.map