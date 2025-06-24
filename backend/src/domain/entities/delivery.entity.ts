export type DeliveryStatus = 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'RETURNED';

export interface Delivery {
  id: string;
  transactionId: string;
  customerId: string;
  status: DeliveryStatus;
  trackingNumber?: string;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateDeliveryData = Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDeliveryData = Partial<Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>>; 