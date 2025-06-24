import { Test, TestingModule } from '@nestjs/testing';
import { GetAllCustomersUseCase } from './get-all-customers.usecase';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';

describe('GetAllCustomersUseCase', () => {
  let useCase: GetAllCustomersUseCase;
  let mockCustomerRepo: jest.Mocked<ICustomerRepository>;
  const mockCustomers = [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      address: {
        street: 'Calle 1',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '00000',
        country: 'CO',
      },
    },
  ];

  beforeEach(async () => {
    const mockCustomerRepoImpl = {
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllCustomersUseCase,
        { provide: ICustomerRepository, useValue: mockCustomerRepoImpl },
      ],
    }).compile();
    useCase = module.get<GetAllCustomersUseCase>(GetAllCustomersUseCase);
    mockCustomerRepo = module.get(ICustomerRepository);
  });

  it('should return all customers', async () => {
    mockCustomerRepo.findAll.mockResolvedValue(mockCustomers);
    const result = await useCase.execute();
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual({ customers: mockCustomers });
  });

  it('should handle repository error', async () => {
    mockCustomerRepo.findAll.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute();
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 