import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCustomerUseCase } from './update-customer.usecase';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;
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
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerUseCase,
        { provide: ICustomerRepository, useValue: mockCustomerRepoImpl },
      ],
    }).compile();
    useCase = module.get<UpdateCustomerUseCase>(UpdateCustomerUseCase);
    mockCustomerRepo = module.get(ICustomerRepository);
  });

  it('should update a customer successfully', async () => {
    mockCustomerRepo.update.mockResolvedValue(mockCustomer);
    const result = await useCase.execute({ id: '1', data: { name: 'Updated' } });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockCustomer);
  });

  it('should handle not found error', async () => {
    mockCustomerRepo.update.mockImplementation(() => Promise.resolve(undefined as any));
    const result = await useCase.execute({ id: '2', data: { name: 'Updated' } });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('Customer not found');
    }
  });

  it('should handle repository error', async () => {
    mockCustomerRepo.update.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ id: '1', data: { name: 'Updated' } });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 