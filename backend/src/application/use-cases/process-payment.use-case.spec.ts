import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from './process-payment.usecase';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { IWompiGateway, WompiPaymentResponse } from '../../domain/gateways/IWompi.gateway';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { Product } from '../../domain/entities/domain/entities/product.entity';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction.entity';
import * as uuid from 'uuid';

const mockTransactionRepo = {
  create: jest.fn(),
  updateStatus: jest.fn(),
};

const mockProductRepo = {
  findById: jest.fn(),
  decreaseStock: jest.fn(),
};

const mockWompiGateway = {
  createPayment: jest.fn(),
};

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let transactionRepo: ITransactionRepository;
  let productRepo: IProductRepository;
  let wompiGateway: IWompiGateway;

  const mockProductId = 'prod_123';
  const mockTransactionId = 'trans_456';
  const mockReference = 'test-reference-uuid';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        { provide: ITransactionRepository, useValue: mockTransactionRepo },
        { provide: IProductRepository, useValue: mockProductRepo },
        { provide: IWompiGateway, useValue: mockWompiGateway },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    transactionRepo = module.get<ITransactionRepository>(ITransactionRepository);
    productRepo = module.get<IProductRepository>(IProductRepository);
    wompiGateway = module.get<IWompiGateway>(IWompiGateway);

    (uuid.v4 as jest.Mock).mockReturnValue(mockReference);
    jest.clearAllMocks();
  });

  const createPaymentDto: CreatePaymentDto = {
    productId: mockProductId,
    customerEmail: 'test@example.com',
    creditCardToken: 'tok_test_123',
    installments: 1,
  };

  const mockProduct: Product = {
    id: mockProductId,
    name: 'Test Product',
    price: 1000,
    stock: 5,
    description: 'A test product',
    imageUrl: 'http://example.com/image.png',
    hasStock: jest.fn().mockReturnValue(true),
    decreaseStock: jest.fn(),
  };

  const mockPendingTransaction: Transaction = {
    id: mockTransactionId,
    productId: mockProductId,
    reference: mockReference,
    amountInCents: mockProduct.price * 100,
    status: 'PENDING',
    customerEmail: createPaymentDto.customerEmail,
    createdAt: new Date(),
  };

  describe('execute', () => {
    it('should process payment successfully when product exists, has stock, and Wompi approves', async () => {
      // Arrange
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      (mockProduct.hasStock as jest.Mock).mockReturnValue(true);
      mockTransactionRepo.create.mockResolvedValue(mockPendingTransaction);
      
      const wompiApprovedResponse: WompiPaymentResponse = {
        id: 'wompi_trans_id',
        status: 'APPROVED',
        reference: mockReference,
      };
      mockWompiGateway.createPayment.mockResolvedValue(wompiApprovedResponse);
      
      const updatedApprovedTransaction: Transaction = {
        ...mockPendingTransaction,
        status: 'APPROVED',
      };
      mockTransactionRepo.updateStatus.mockResolvedValue(updatedApprovedTransaction);

      // Act
      const result = await useCase.execute(createPaymentDto);

      // Assert
      expect(productRepo.findById).toHaveBeenCalledWith(mockProductId);
      expect(mockProduct.hasStock).toHaveBeenCalledWith(1);
      expect(transactionRepo.create).toHaveBeenCalledWith({
        productId: mockProductId,
        reference: mockReference,
        amountInCents: mockProduct.price * 100,
        status: 'PENDING',
        customerEmail: createPaymentDto.customerEmail,
      });
      expect(wompiGateway.createPayment).toHaveBeenCalledWith({
        amountInCents: mockPendingTransaction.amountInCents,
        currency: 'COP',
        customerEmail: createPaymentDto.customerEmail,
        reference: mockReference,
        paymentMethod: {
          type: 'CARD',
          token: createPaymentDto.creditCardToken,
          installments: createPaymentDto.installments,
        },
      });
      expect(transactionRepo.updateStatus).toHaveBeenCalledWith(mockTransactionId, 'APPROVED');
      expect(productRepo.decreaseStock).toHaveBeenCalledWith(mockProductId, 1);
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value).toEqual(updatedApprovedTransaction);
      }
    });

    it('should return error if product is not found', async () => {
      // Arrange
      mockProductRepo.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(createPaymentDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error.message).toBe('Product not found');
      }
      expect(transactionRepo.create).not.toHaveBeenCalled();
      expect(wompiGateway.createPayment).not.toHaveBeenCalled();
    });

    it('should return error if product has insufficient stock', async () => {
      // Arrange
      const productNoStock = { ...mockProduct, hasStock: jest.fn().mockReturnValue(false) };
      mockProductRepo.findById.mockResolvedValue(productNoStock);

      // Act
      const result = await useCase.execute(createPaymentDto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error.message).toBe('Insufficient stock');
      }
      expect(transactionRepo.create).not.toHaveBeenCalled();
      expect(wompiGateway.createPayment).not.toHaveBeenCalled();
    });

    it('should update transaction to DECLINED and return error if Wompi gateway fails', async () => {
      // Arrange
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      (mockProduct.hasStock as jest.Mock).mockReturnValue(true);
      mockTransactionRepo.create.mockResolvedValue(mockPendingTransaction);
      mockWompiGateway.createPayment.mockRejectedValue(new Error('Wompi API down'));
      
      const updatedDeclinedTransaction: Transaction = {
        ...mockPendingTransaction,
        status: 'DECLINED',
      };
      mockTransactionRepo.updateStatus.mockResolvedValue(updatedDeclinedTransaction);

      // Act
      const result = await useCase.execute(createPaymentDto);

      // Assert
      expect(wompiGateway.createPayment).toHaveBeenCalled();
      expect(transactionRepo.updateStatus).toHaveBeenCalledWith(mockTransactionId, 'DECLINED');
      expect(productRepo.decreaseStock).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error.message).toBe('Payment provider error');
      }
    });

    it('should update transaction to DECLINED if Wompi payment is declined', async () => {
      // Arrange
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      (mockProduct.hasStock as jest.Mock).mockReturnValue(true);
      mockTransactionRepo.create.mockResolvedValue(mockPendingTransaction);
      
      const wompiDeclinedResponse: WompiPaymentResponse = {
        id: 'wompi_trans_id_declined',
        status: 'DECLINED',
        reference: mockReference,
      };
      mockWompiGateway.createPayment.mockResolvedValue(wompiDeclinedResponse);
      
      const updatedDeclinedTransaction: Transaction = {
        ...mockPendingTransaction,
        status: 'DECLINED',
      };
      mockTransactionRepo.updateStatus.mockResolvedValue(updatedDeclinedTransaction);

      // Act
      const result = await useCase.execute(createPaymentDto);

      // Assert
      expect(wompiGateway.createPayment).toHaveBeenCalled();
      expect(transactionRepo.updateStatus).toHaveBeenCalledWith(mockTransactionId, 'DECLINED');
      expect(productRepo.decreaseStock).not.toHaveBeenCalled();
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.status).toBe('DECLINED');
      }
    });

    it('should handle different installments correctly', async () => {
      // Arrange
      const paymentDtoWithInstallments = { ...createPaymentDto, installments: 3 };
      mockProductRepo.findById.mockResolvedValue(mockProduct);
      (mockProduct.hasStock as jest.Mock).mockReturnValue(true);
      mockTransactionRepo.create.mockResolvedValue(mockPendingTransaction);
      
      const wompiApprovedResponse: WompiPaymentResponse = {
        id: 'wompi_trans_id',
        status: 'APPROVED',
        reference: mockReference,
      };
      mockWompiGateway.createPayment.mockResolvedValue(wompiApprovedResponse);
      
      const updatedApprovedTransaction: Transaction = {
        ...mockPendingTransaction,
        status: 'APPROVED',
      };
      mockTransactionRepo.updateStatus.mockResolvedValue(updatedApprovedTransaction);

      // Act
      const result = await useCase.execute(paymentDtoWithInstallments);

      // Assert
      expect(wompiGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentMethod: expect.objectContaining({
            installments: 3,
          }),
        })
      );
      expect(result.isSuccess).toBe(true);
    });

    it('should handle different product prices correctly', async () => {
      // Arrange
      const expensiveProduct = { 
        ...mockProduct, 
        price: 5000,
        hasStock: jest.fn().mockReturnValue(true),
      };
      mockProductRepo.findById.mockResolvedValue(expensiveProduct);
      
      const expensiveTransaction = {
        ...mockPendingTransaction,
        amountInCents: expensiveProduct.price * 100,
      };
      mockTransactionRepo.create.mockResolvedValue(expensiveTransaction);
      
      const wompiApprovedResponse: WompiPaymentResponse = {
        id: 'wompi_trans_id',
        status: 'APPROVED',
        reference: mockReference,
      };
      mockWompiGateway.createPayment.mockResolvedValue(wompiApprovedResponse);
      
      const updatedApprovedTransaction: Transaction = {
        ...expensiveTransaction,
        status: 'APPROVED',
      };
      mockTransactionRepo.updateStatus.mockResolvedValue(updatedApprovedTransaction);

      // Act
      const result = await useCase.execute(createPaymentDto);

      // Assert
      expect(transactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amountInCents: 500000, // 5000 * 100
        })
      );
      expect(wompiGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          amountInCents: 500000,
        })
      );
      expect(result.isSuccess).toBe(true);
    });
  });
}); 