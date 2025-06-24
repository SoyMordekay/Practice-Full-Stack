export interface WompiPaymentData {
    amountInCents: number;
    currency: 'COP';
    customerEmail: string;
    paymentMethod: {
        type: 'CARD';
        token: string;
        installments: number;
    };
    reference: string;
}
export interface WompiPaymentResponse {
    id: string;
    status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
}
export declare const IWompiGateway: unique symbol;
export interface IWompiGateway {
    createPayment(data: WompiPaymentData): Promise<WompiPaymentResponse>;
}
