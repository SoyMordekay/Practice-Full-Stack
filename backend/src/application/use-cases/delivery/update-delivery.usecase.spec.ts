import { Test, TestingModule } from '@nestjs/testing';
import { UpdateDeliveryUseCase } from './update-delivery.usecase';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';

describe('UpdateDeliveryUseCase', () => {
  let useCase: UpdateDeliveryUseCase;
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
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateDeliveryUseCase,
        { provide: IDeliveryRepository, useValue: mockDeliveryRepoImpl },
      ],
    }).compile();
    useCase = module.get<UpdateDeliveryUseCase>(UpdateDeliveryUseCase);
    mockDeliveryRepo = module.get(IDeliveryRepository);
  });

  it('should update a delivery successfully', async () => {
    mockDeliveryRepo.update.mockResolvedValue(mockDelivery);
    const result = await useCase.execute({ id: '1', data: { status: 'DELIVERED' } });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockDelivery);
  });

  it('should handle not found error', async () => {
    mockDeliveryRepo.update.mockImplementation(() => Promise.resolve(undefined as any));
    const result = await useCase.execute({ id: '2', data: { status: 'DELIVERED' } });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('Delivery not found');
    }
  });

  it('should handle repository error', async () => {
    mockDeliveryRepo.update.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ id: '1', data: { status: 'DELIVERED' } });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 