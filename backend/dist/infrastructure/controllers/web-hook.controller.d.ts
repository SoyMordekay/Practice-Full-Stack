import { ConfigService } from '@nestjs/config';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { TransactionStatus } from '../../domain/entities/transaction.entity';
import { WompiGateway } from '../gateways/wompi/wompi.gateway';
interface WompiWebhookPayload {
    event: string;
    data: {
        transaction: {
            id: string;
            status: TransactionStatus;
            reference: string;
            amount_in_cents: number;
            currency: string;
        };
    };
    signature?: {
        checksum: string;
        properties: string[];
    };
    timestamp: number;
    sent_at: string;
}
export declare class WompiWebhookController {
    private readonly configService;
    private readonly transactionRepo;
    private readonly productRepo;
    private readonly wompiGateway;
    private readonly logger;
    private readonly WOMPI_EVENTS_SECRET;
    constructor(configService: ConfigService, transactionRepo: ITransactionRepository, productRepo: IProductRepository, wompiGateway: WompiGateway);
    private isValidSignature;
    handleWompiEvent(payload: WompiWebhookPayload): Promise<{
        message: string;
    }>;
    handleWebhook(payload: any, signature: string, timestamp: string): Promise<{
        success: boolean;
        event: string;
    }>;
}
export {};
