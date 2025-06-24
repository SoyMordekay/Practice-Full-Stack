import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockProcessPaymentUseCase = {
  execute: jest.fn(),
};

describe('PaymentController', () => {
  let controller: PaymentController;
  let useCase: ProcessPaymentUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        { provide: ProcessPaymentUseCase, useValue: mockProcessPaymentUseCase },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);

    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPaymentDto: CreatePaymentDto = {
      productId: 'prod_123',
      customerEmail: 'test@example.com',
      creditCardToken: 'tok_test_123',
      installments: 1,
    };

    const mockTransaction: Transaction = {
      id: 'trans_456',
      productId: 'prod_123',
      reference: 'ref_789',
      amountInCents: 100000,
      status: 'APPROVED' as TransactionStatus,
      customerEmail: 'test@example.com',
      createdAt: new Date(),
    };

    it('should process payment successfully', async () => {
      // Arrange
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(createPaymentDto);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw HttpException when payment processing fails', async () => {
      // Arrange
      const error = new Error('Payment failed');
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error,
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createPaymentDto)).rejects.toThrow('Payment failed');
      expect(useCase.execute).toHaveBeenCalledWith(createPaymentDto);
    });

    it('should handle product not found error', async () => {
      // Arrange
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Product not found'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createPaymentDto)).rejects.toThrow('Product not found');
    });

    it('should handle insufficient stock error', async () => {
      // Arrange
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Insufficient stock'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createPaymentDto)).rejects.toThrow('Insufficient stock');
    });

    it('should handle payment provider error', async () => {
      // Arrange
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: false,
        error: new Error('Payment provider error'),
      });

      // Act & Assert
      await expect(controller.create(createPaymentDto)).rejects.toThrow(HttpException);
      await expect(controller.create(createPaymentDto)).rejects.toThrow('Payment provider error');
    });

    it('should handle different installments', async () => {
      // Arrange
      const paymentDtoWithInstallments = { ...createPaymentDto, installments: 3 };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(paymentDtoWithInstallments);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(paymentDtoWithInstallments);
      expect(result).toEqual(mockTransaction);
    });

    it('should handle different product IDs', async () => {
      // Arrange
      const paymentDtoWithDifferentProduct = { ...createPaymentDto, productId: 'prod_456' };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(paymentDtoWithDifferentProduct);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(paymentDtoWithDifferentProduct);
      expect(result).toEqual(mockTransaction);
    });

    it('should handle different customer emails', async () => {
      // Arrange
      const paymentDtoWithDifferentEmail = { 
        ...createPaymentDto, 
        customerEmail: 'different@example.com' 
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(paymentDtoWithDifferentEmail);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(paymentDtoWithDifferentEmail);
      expect(result).toEqual(mockTransaction);
    });

    it('should handle different credit card tokens', async () => {
      // Arrange
      const paymentDtoWithDifferentToken = { 
        ...createPaymentDto, 
        creditCardToken: 'tok_test_456' 
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: mockTransaction,
      });

      // Act
      const result = await controller.create(paymentDtoWithDifferentToken);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(paymentDtoWithDifferentToken);
      expect(result).toEqual(mockTransaction);
    });

    it('should handle declined transaction status', async () => {
      // Arrange
      const declinedTransaction = { ...mockTransaction, status: 'DECLINED' as TransactionStatus };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: declinedTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(createPaymentDto);
      expect(result).toEqual(declinedTransaction);
      expect(result.status).toBe('DECLINED');
    });

    it('should handle pending transaction status', async () => {
      // Arrange
      const pendingTransaction = { ...mockTransaction, status: 'PENDING' as TransactionStatus };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: pendingTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(createPaymentDto);
      expect(result).toEqual(pendingTransaction);
      expect(result.status).toBe('PENDING');
    });

    it('should handle transaction with different amounts', async () => {
      // Arrange
      const expensiveTransaction = { 
        ...mockTransaction, 
        amountInCents: 500000 
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: expensiveTransaction,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(createPaymentDto);
      expect(result).toEqual(expensiveTransaction);
      expect(result.amountInCents).toBe(500000);
    });

    it('should handle transaction with different references', async () => {
      // Arrange
      const transactionWithDifferentRef = { 
        ...mockTransaction, 
        reference: 'different_ref_123' 
      };
      mockProcessPaymentUseCase.execute.mockResolvedValue({
        isSuccess: true,
        value: transactionWithDifferentRef,
      });

      // Act
      const result = await controller.create(createPaymentDto);

      // Assert
      expect(useCase.execute).toHaveBeenCalledWith(createPaymentDto);
      expect(result).toEqual(transactionWithDifferentRef);
      expect(result.reference).toBe('different_ref_123');
    });
  });
}); 