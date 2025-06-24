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
  reference: any;
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
}

export interface WompiTransactionStatusResponse {
  id: string;
  status: string;
  amount_in_cents: number;
  reference: string;
  // Puedes agregar más campos según la respuesta real de Wompi
}

export const IWompiGateway = Symbol('IWompiGateway');

export interface IWompiGateway {
  createPayment(data: WompiPaymentData): Promise<WompiPaymentResponse>;
  getTransactionStatus(transactionId: string): Promise<WompiTransactionStatusResponse>;
}