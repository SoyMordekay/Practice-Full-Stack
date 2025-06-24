export class CreatePaymentDto {
  productId: string;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
}
