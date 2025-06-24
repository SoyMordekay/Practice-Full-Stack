import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCustomerUseCase } from './delete-customer.usecase';
import { ICustomerRepository } from '../../../domain/repositories/ICustomer.repository';

describe('DeleteCustomerUseCase', () => {
  let useCase: DeleteCustomerUseCase;
  let mockCustomerRepo: jest.Mocked<ICustomerRepository>;

  beforeEach(async () => {
    const mockCustomerRepoImpl = {
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerUseCase,
        { provide: ICustomerRepository, useValue: mockCustomerRepoImpl },
      ],
    }).compile();
    useCase = module.get<DeleteCustomerUseCase>(DeleteCustomerUseCase);
    mockCustomerRepo = module.get(ICustomerRepository);
  });

  it('should delete a customer successfully', async () => {
    mockCustomerRepo.delete.mockResolvedValue(undefined);
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual({ success: true });
  });

  it('should handle repository error', async () => {
    mockCustomerRepo.delete.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 