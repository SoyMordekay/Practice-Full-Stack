import { Test, TestingModule } from '@nestjs/testing';
import { DeleteDeliveryUseCase } from './delete-delivery.usecase';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';

describe('DeleteDeliveryUseCase', () => {
  let useCase: DeleteDeliveryUseCase;
  let mockDeliveryRepo: jest.Mocked<IDeliveryRepository>;

  beforeEach(async () => {
    const mockDeliveryRepoImpl = {
      delete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteDeliveryUseCase,
        { provide: IDeliveryRepository, useValue: mockDeliveryRepoImpl },
      ],
    }).compile();
    useCase = module.get<DeleteDeliveryUseCase>(DeleteDeliveryUseCase);
    mockDeliveryRepo = module.get(IDeliveryRepository);
  });

  it('should delete a delivery successfully', async () => {
    mockDeliveryRepo.delete.mockResolvedValue(undefined);
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual({ success: true });
  });

  it('should handle repository error', async () => {
    mockDeliveryRepo.delete.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 