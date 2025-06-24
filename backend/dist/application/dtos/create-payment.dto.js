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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePaymentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CustomerDataDto {
    name;
    email;
    phone;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerDataDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CustomerDataDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CustomerDataDto.prototype, "phone", void 0);
class DeliveryDataDto {
    address;
    city;
    state;
    zipCode;
    country;
    customerEmail;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryDataDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryDataDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryDataDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryDataDto.prototype, "zipCode", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryDataDto.prototype, "country", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], DeliveryDataDto.prototype, "customerEmail", void 0);
class CreatePaymentDto {
    productId;
    customerEmail;
    creditCardToken;
    installments;
    customerData;
    deliveryData;
}
exports.CreatePaymentDto = CreatePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01cf41c6-ab6f-4cc2-b80f-5cc4b7792f31', description: 'ID del producto a comprar' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'cliente@email.com', description: 'Email del cliente' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'tok_stagtest_5113_...', description: 'Token de la tarjeta generado por Wompi' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentDto.prototype, "creditCardToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Cantidad de cuotas' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePaymentDto.prototype, "installments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: {
            name: 'María García',
            email: 'maria.garcia@test.com',
            phone: '3101234567',
        },
        description: 'Datos del cliente',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CustomerDataDto),
    __metadata("design:type", CustomerDataDto)
], CreatePaymentDto.prototype, "customerData", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: {
            address: 'Calle 123',
            city: 'Bogotá',
            state: 'Cundinamarca',
            zipCode: '11001',
            country: 'Colombia',
            customerEmail: 'maria.garcia@test.com',
        },
        description: 'Datos de entrega',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DeliveryDataDto),
    __metadata("design:type", DeliveryDataDto)
], CreatePaymentDto.prototype, "deliveryData", void 0);
//# sourceMappingURL=create-payment.dto.js.map