import { Test, TestingModule } from '@nestjs/testing';
import { GetDeliveryByIdUseCase } from './get-delivery-by-id.usecase';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';

describe('GetDeliveryByIdUseCase', () => {
  let useCase: GetDeliveryByIdUseCase;
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
      findById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDeliveryByIdUseCase,
        { provide: IDeliveryRepository, useValue: mockDeliveryRepoImpl },
      ],
    }).compile();
    useCase = module.get<GetDeliveryByIdUseCase>(GetDeliveryByIdUseCase);
    mockDeliveryRepo = module.get(IDeliveryRepository);
  });

  it('should return delivery if found', async () => {
    mockDeliveryRepo.findById.mockResolvedValue(mockDelivery);
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(mockDelivery);
  });

  it('should return error if delivery not found', async () => {
    mockDeliveryRepo.findById.mockResolvedValue(null as any);
    const result = await useCase.execute({ id: '2' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('Delivery not found');
    }
  });

  it('should handle repository error', async () => {
    mockDeliveryRepo.findById.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute({ id: '1' });
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 