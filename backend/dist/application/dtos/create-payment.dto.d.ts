declare class CustomerDataDto {
    name: string;
    email: string;
    phone: string;
}
declare class DeliveryDataDto {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    customerEmail: string;
}
export declare class CreatePaymentDto {
    productId: string;
    customerEmail: string;
    creditCardToken: string;
    installments: number;
    customerData?: CustomerDataDto;
    deliveryData?: DeliveryDataDto;
}
export {};
