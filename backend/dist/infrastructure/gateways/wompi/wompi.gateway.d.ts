import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { IWompiGateway, WompiPaymentData, WompiPaymentResponse, WompiTransactionStatusResponse } from '../../../domain/gateways/IWompi.gateway';
export interface WompiTransactionStatus {
    id: string;
    status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR';
    reference: string;
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    payment_method: {
        type: string;
        extra: any;
    };
    status_message?: string;
    created_at: string;
    finalized_at?: string;
    shipping_address?: any;
    payment_link_id?: string;
    payment_source_id?: number;
}
export interface WompiWebhookEvent {
    event: string;
    data: {
        transaction: WompiTransactionStatus;
    };
    sent_at: string;
    timestamp: number;
    signature: {
        properties: string[];
        checksum: string;
    };
}
export interface WompiTestCards {
    approved: string;
    declined: string;
    pending: string;
    insufficient: string;
    fraud: string;
}
export declare class WompiGateway implements IWompiGateway {
    private readonly configService;
    private readonly httpService;
    private readonly logger;
    private readonly WOMPI_API_BASE_URL;
    private readonly WOMPI_PRIVATE_KEY;
    private readonly WOMPI_PUBLIC_KEY;
    private readonly WOMPI_INTEGRITY_KEY;
    private readonly WOMPI_EVENTS_SECRET;
    private acceptanceToken;
    readonly TEST_CARDS: WompiTestCards;
    constructor(configService: ConfigService, httpService: HttpService);
    private getAcceptanceToken;
    private generateIntegritySignature;
    createPayment(data: WompiPaymentData): Promise<WompiPaymentResponse>;
    getTransactionStatus(transactionId: string): Promise<WompiTransactionStatusResponse>;
    validateWebhookSignature(payload: string, signature: string, timestamp: string): boolean;
    processWebhookEvent(payload: string, signature: string, timestamp: string): Promise<WompiWebhookEvent>;
    private handleTransactionUpdated;
    private handleTransactionCreated;
    generateTestCardToken(cardNumber: string, testScenario?: keyof WompiTestCards): Promise<string>;
    clearAcceptanceTokenCache(): void;
    getTestingInfo(): {
        testCards: WompiTestCards;
        expectedOutcomes: Record<keyof WompiTestCards, string>;
    };
}
