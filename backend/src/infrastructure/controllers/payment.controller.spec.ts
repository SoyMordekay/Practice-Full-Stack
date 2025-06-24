import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.usecase';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
import { Transaction } from '../../domain/entities/transaction.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PaymentController', () => {
  let controller: PaymentController;
  let mockProcessPaymentUseCase: jest.Mocked<ProcessPaymentUseCase>;
  let mockGetTransactionStatusUseCase: jest.Mocked<GetTransactionStatusUseCase>;

  const mockTransaction: Transaction = {
    id: 'txn-123',
    productId: '1',
    amountInCents: 100000,
    status: 'APPROVED',
    reference: 'ref-123',
    customerEmail: 'test@example.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockProcessPaymentUseCaseImpl = {
      execute: jest.fn(),
    };

    const mockGetTransactionStatusUseCaseImpl = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: ProcessPaymentUseCase,
          useValue: mockProcessPaymentUseCaseImpl,
        },
        {
          provide: GetTransactionStatusUseCase,
          useValue: mockGetTransactionStatusUseCaseImpl,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    mockProcessPaymentUseCase = module.get(ProcessPaymentUseCase);
    mockGetTransactionStatusUseCase = module.get(GetTransactionStatusUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should process payment successfully', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should throw HttpException when payment processing fails', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Payment failed'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(
        'Payment failed',
      );
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should handle product not found error', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '999',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Product not found'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(
        'Product not found',
      );
    });

    it('should handle insufficient stock error', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Insufficient stock'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(
        'Insufficient stock',
      );
    });

    it('should handle payment provider error', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Payment provider error'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(
        'Payment provider error',
      );
    });

    it('should handle different installments', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 3,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should handle different product IDs', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '2',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should handle different customer emails', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'different@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should handle different credit card tokens', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_456',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(mockTransaction);
      expect(mockProcessPaymentUseCase.execute).toHaveBeenCalledWith(
        createPaymentDto,
      );
    });

    it('should handle declined transaction status', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const declinedTransaction = {
        ...mockTransaction,
        status: 'DECLINED' as const,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: declinedTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(declinedTransaction);
    });

    it('should handle pending transaction status', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const pendingTransaction = {
        ...mockTransaction,
        status: 'PENDING' as const,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: pendingTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(pendingTransaction);
    });

    it('should handle transaction with different amounts', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const expensiveTransaction = {
        ...mockTransaction,
        amountInCents: 500000,
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: expensiveTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(expensiveTransaction);
    });

    it('should handle transaction with different references', async () => {
      // Arrange
      const createPaymentDto: CreatePaymentDto = {
        productId: '1',
        creditCardToken: 'tok_test_123',
        customerEmail: 'test@example.com',
        installments: 1,
      };

      const transactionWithDifferentRef = {
        ...mockTransaction,
        reference: 'different-ref',
      };

      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: transactionWithDifferentRef,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(result).toEqual(transactionWithDifferentRef);
    });
  });

  describe('getTransactionStatus', () => {
    it('should get transaction status successfully', async () => {
      // Arrange
      const transactionId = 'wompi-123';
      const statusResponse = {
        id: 'wompi-123',
        status: 'APPROVED',
        amount_in_cents: 100000,
        reference: 'ref-123',
        customer_email: 'test@example.com',
        created_at: '2025-06-24T04:16:18.971Z',
        finalized_at: '2025-06-24T04:16:19.982Z',
      };

      mockGetTransactionStatusUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: statusResponse,
      });

      // Act
      const result = await controller.getTransactionStatus(transactionId);

      // Assert
      expect(result).toEqual(statusResponse);
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith({
        transactionId,
      });
    });

    it('should throw HttpException when status check fails', async () => {
      // Arrange
      const transactionId = 'wompi-123';

      mockGetTransactionStatusUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Transaction not found'),
      });

      // Act & Assert
      await expect(
        controller.getTransactionStatus(transactionId),
      ).rejects.toThrow('Transaction not found');
      expect(mockGetTransactionStatusUseCase.execute).toHaveBeenCalledWith({
        transactionId,
      });
    });
  });
});
