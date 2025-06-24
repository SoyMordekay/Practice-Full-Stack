import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from './process-payment.usecase';
import { IWompiGateway } from '../../domain/gateways/IWompi.gateway';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { Product } from '../../domain/entities/domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let mockWompiGateway: jest.Mocked<IWompiGateway>;
  let mockTransactionRepo: jest.Mocked<ITransactionRepository>;
  let mockProductRepo: jest.Mocked<IProductRepository>;

  const makeMockProduct = (overrides = {}) => ({
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100000,
    stock: 10,
    imageUrl: 'http://example.com/image.png',
    hasStock: jest.fn().mockReturnValue(true),
    decreaseStock: jest.fn(),
    ...overrides,
  });

  const mockTransaction: Transaction = {
    id: 'txn-123',
    productId: '1',
    amountInCents: 100000,
    status: 'APPROVED',
    reference: 'ref-123',
    wompiTransactionId: 'wompi-123',
    customerEmail: 'test@example.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockWompiGatewayImpl = {
      createPayment: jest.fn(),
    };

    const mockTransactionRepoImpl = {
      create: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockProductRepoImpl = {
      findById: jest.fn(),
      decreaseStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        {
          provide: IWompiGateway,
          useValue: mockWompiGatewayImpl,
        },
        {
          provide: ITransactionRepository,
          useValue: mockTransactionRepoImpl,
        },
        {
          provide: IProductRepository,
          useValue: mockProductRepoImpl,
        },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    mockWompiGateway = module.get(IWompiGateway);
    mockTransactionRepo = module.get(ITransactionRepository);
    mockProductRepo = module.get(IProductRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should process payment successfully', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockProductRepo.findById).toHaveBeenCalledWith('1');
      expect(mockTransactionRepo.create).toHaveBeenCalled();
      expect(mockWompiGateway.createPayment).toHaveBeenCalled();
      expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith(
        'txn-123',
        'APPROVED',
      );
    });

    it('should handle product not found error', async () => {
      // Arrange
      const paymentData = {
        productId: '999',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error?.message).toBe('Product not found');
      }
    });

    it('should handle insufficient stock error', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const productWithLowStock = makeMockProduct({ stock: 0, hasStock: jest.fn().mockReturnValue(false) });

      mockProductRepo.findById.mockResolvedValue(productWithLowStock);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error?.message).toBe('Insufficient stock');
      }
    });

    it('should handle payment provider error', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockRejectedValue(
        new Error('Payment failed'),
      );
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error?.message).toBe('Payment provider error');
      }
      expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith(
        'txn-123',
        'DECLINED',
      );
    });

    it('should handle different installments', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 3,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockWompiGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: expect.objectContaining({
            installments: 3,
          }),
        }),
      );
    });

    it('should handle different product IDs', async () => {
      // Arrange
      const paymentData = {
        productId: '2',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const differentProduct = makeMockProduct({ id: '2', name: 'Different Product' });

      mockProductRepo.findById.mockResolvedValue(differentProduct);
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockProductRepo.findById).toHaveBeenCalledWith('2');
    });

    it('should handle different customer emails', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'different@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockWompiGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          customerEmail: 'different@example.com',
        }),
      );
    });

    it('should handle different credit card tokens', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_456',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockWompiGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: expect.objectContaining({
            token: 'tok_test_456',
          }),
        }),
      );
    });

    it('should handle declined transaction status', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'DECLINED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith(
        'txn-123',
        'DECLINED',
      );
    });

    it('should handle pending transaction status', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(mockTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'DECLINED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(mockTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockTransactionRepo.updateStatus).toHaveBeenCalledWith(
        'txn-123',
        'DECLINED',
      );
    });

    it('should handle transaction with different amounts', async () => {
      // Arrange
      const expensiveProduct = makeMockProduct({ price: 500000 });
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProductRepo.findById.mockResolvedValue(expensiveProduct);
      const expensiveTransaction = { ...mockTransaction, amountInCents: expensiveProduct.price * 100 };
      mockTransactionRepo.create.mockResolvedValue(expensiveTransaction);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(expensiveTransaction);

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      const call = mockWompiGateway.createPayment.mock.calls[0][0];
      expect(call.amountInCents).toBe(expensiveProduct.price * 100);
    });

    it('should handle transaction with different references', async () => {
      // Arrange
      const paymentData = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const transactionWithDifferentRef = {
        ...mockTransaction,
        reference: 'different-ref',
      };

      mockProductRepo.findById.mockResolvedValue(makeMockProduct());
      mockTransactionRepo.create.mockResolvedValue(transactionWithDifferentRef);
      mockWompiGateway.createPayment.mockResolvedValue({
        id: 'wompi-123',
        status: 'APPROVED',
        reference: 'different-ref',
      });
      mockTransactionRepo.updateStatus.mockResolvedValue(
        transactionWithDifferentRef,
      );

      // Act
      const result = await useCase.execute(paymentData);

      // Assert
      expect(result.isSuccess).toBe(true);
      const call = mockWompiGateway.createPayment.mock.calls[0][0];
      expect(typeof call.reference).toBe('string');
      expect(call.reference.length).toBeGreaterThan(0);
    });
  });
});
