import { Test, TestingModule } from '@nestjs/testing';
import { GetAllDeliveriesUseCase } from './get-all-deliveries.usecase';
import { IDeliveryRepository } from '../../../domain/repositories/IDelivery.repository';

describe('GetAllDeliveriesUseCase', () => {
  let useCase: GetAllDeliveriesUseCase;
  let mockDeliveryRepo: jest.Mocked<IDeliveryRepository>;
  const mockDeliveries = [
    {
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
    },
  ];

  beforeEach(async () => {
    const mockDeliveryRepoImpl = {
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllDeliveriesUseCase,
        { provide: IDeliveryRepository, useValue: mockDeliveryRepoImpl },
      ],
    }).compile();
    useCase = module.get<GetAllDeliveriesUseCase>(GetAllDeliveriesUseCase);
    mockDeliveryRepo = module.get(IDeliveryRepository);
  });

  it('should return all deliveries', async () => {
    mockDeliveryRepo.findAll.mockResolvedValue(mockDeliveries);
    const result = await useCase.execute();
    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual({ deliveries: mockDeliveries });
  });

  it('should handle repository error', async () => {
    mockDeliveryRepo.findAll.mockRejectedValue(new Error('DB error'));
    const result = await useCase.execute();
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error?.message).toBe('DB error');
    }
  });
}); 