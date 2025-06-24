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
exports.TransactionRepositoryPg = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../../../domain/entities/transaction.entity");
const transaction_orm_entity_1 = require("../entities/transaction.orm-entity");
let TransactionRepositoryPg = class TransactionRepositoryPg {
    typeOrmRepo;
    constructor(typeOrmRepo) {
        this.typeOrmRepo = typeOrmRepo;
    }
    toDomain(ormEntity) {
        if (!ormEntity)
            return null;
        const domainEntity = new transaction_entity_1.Transaction();
        Object.assign(domainEntity, ormEntity);
        domainEntity.status = ormEntity.status;
        return domainEntity;
    }
    async create(transactionData) {
        const savedEntity = await this.typeOrmRepo.save(transactionData);
        if (!savedEntity)
            throw new Error('Failed to create transaction in database.');
        return this.toDomain(savedEntity);
    }
    async findById(id) {
        const ormEntity = await this.typeOrmRepo.findOneBy({ id });
        return this.toDomain(ormEntity);
    }
    async updateStatus(id, status, wompiTransactionId, wompiResponse) {
        const updatePayload = { status };
        if (wompiTransactionId) {
            updatePayload.wompiTransactionId = wompiTransactionId;
        }
        if (wompiResponse) {
            updatePayload.wompiResponse = wompiResponse;
        }
        const updateResult = await this.typeOrmRepo.update(id, updatePayload);
        if (updateResult.affected === 0) {
            throw new Error(`Transaction with local id "${id}" not found for status update.`);
        }
        const updatedOrmEntity = await this.typeOrmRepo.findOneBy({ id });
        if (!updatedOrmEntity) {
            throw new Error(`Failed to retrieve transaction with local id "${id}" after status update.`);
        }
        return this.toDomain(updatedOrmEntity);
    }
    async findByReference(reference) {
        const ormEntity = await this.typeOrmRepo.findOneBy({ reference });
        return this.toDomain(ormEntity);
    }
};
exports.TransactionRepositoryPg = TransactionRepositoryPg;
exports.TransactionRepositoryPg = TransactionRepositoryPg = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_orm_entity_1.TransactionOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TransactionRepositoryPg);
//# sourceMappingURL=transaction.repository.js.map