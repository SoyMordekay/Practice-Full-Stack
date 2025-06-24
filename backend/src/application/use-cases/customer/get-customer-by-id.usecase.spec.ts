import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomerByIdUseCase } from './get-customer-by-id.usecase';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';

describe('GetCustomerByIdUseCase', () => {
  let useCase: GetCustomerByIdUseCase;
  let mockCustomerRepo: jest.Mocked<ICustomerRepository>;
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

  beforeEach(async () => {
    const mockCustomerRepoImpl = {
      findById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerByIdUseCase,
        { provide: ICustomerRepository, useValue: mockCustomerRepoImpl },
      ],
    }).compile();
    useCase = module.get<GetCustomerByIdUseCase>(GetCustomerByIdUseCase);
    mockCustomerRepo = module.get(ICustomerRepository);
  });

  it('should return customer if found', async () => {
    mockCustomerRepo.findById.mockResolvedValue(mockCustomer);
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCustomer);
  });

  it('should return error if customer not found', async () => {
    mockCustomerRepo.findById.mockResolvedValue(null);
    const result = await useCase.execute({ id: '2' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('Customer not found');
    }
  });

  it('should handle repository error', async () => {
    mockCustomerRepo.findById.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 