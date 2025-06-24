import { Test, TestingModule } from '@nestjs/testing';
import { CreateDeliveryUseCase } from './create-delivery.usecase';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';

describe('CreateDeliveryUseCase', () => {
  let useCase: CreateDeliveryUseCase;
  let mockDeliveryRepo: jest.Mocked<IDeliveryRepository>;
  const mockDelivery = {
    id: '1',
    address: {
      street: 'Calle 1',
      city: 'Ciudad',
      state: 'Estado',
      zipCode: '00000',
      country: 'CO',
    },
    createdAt: new Date(),
    transactionId: 'txn-1',
    customerId: 'cust-1',
    status: 'PENDING' as import('../../../domain/entities/delivery.entity').DeliveryStatus,
    estimatedDeliveryDate: new Date(),
  };

  beforeEach(async () => {
    const mockDeliveryRepoImpl = {
      create: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDeliveryUseCase,
        { provide: IDeliveryRepository, useValue: mockDeliveryRepoImpl },
      ],
    }).compile();
    useCase = module.get<CreateDeliveryUseCase>(CreateDeliveryUseCase);
    mockDeliveryRepo = module.get(IDeliveryRepository);
  });

  it('should create a delivery successfully', async () => {
    mockDeliveryRepo.create.mockResolvedValue(mockDelivery);
    const result = await useCase.execute({ ...mockDelivery });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockDelivery);
  });

  it('should handle repository error', async () => {
    mockDeliveryRepo.create.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ ...mockDelivery });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 