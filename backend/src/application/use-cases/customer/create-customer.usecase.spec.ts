import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from './create-customer.usecase';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';

const mockCustomer = {
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
};

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let mockCustomerRepo: jest.Mocked<ICustomerRepository>;

  beforeEach(async () => {
    const mockCustomerRepoImpl = {
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        { provide: ICustomerRepository, useValue: mockCustomerRepoImpl },
      ],
    }).compile();
    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
    mockCustomerRepo = module.get(ICustomerRepository);
  });

  it('should create a customer successfully', async () => {
    mockCustomerRepo.create.mockResolvedValue(mockCustomer);
    const result = await useCase.execute({ ...mockCustomer });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCustomer);
  });

  it('should handle repository error', async () => {
    mockCustomerRepo.create.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ ...mockCustomer });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 