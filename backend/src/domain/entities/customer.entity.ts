export class Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateCustomerData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerData = Partial<CreateCustomerData>; 