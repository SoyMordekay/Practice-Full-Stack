import { Test, TestingModule } from '@nestjs/testing';
import { WompiGateway } from './wompi.gateway';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  IWompiGateway,
  WompiPaymentData,
} from '../../../domain/gateways/IWompi.gateway';
import { lastValueFrom } from 'rxjs';

describe('WompiGateway', () => {
  let gateway: WompiGateway;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiGateway,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    gateway = module.get<WompiGateway>(WompiGateway);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks();

    // Mock getAcceptanceToken method
    jest
      .spyOn(gateway as any, 'getAcceptanceToken')
      .mockResolvedValue('test-acceptance-token');
  });

  describe('createPayment', () => {
    const paymentData: WompiPaymentData = {
      amountInCents: 100000,
      currency: 'COP',
      customerEmail: 'test@example.com',
      reference: 'ref-123',
      paymentMethod: {
        type: 'CARD',
        token: 'tok_test',
        installments: 1,
      },
    };

    it('should return approved response when Wompi approves', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {
          data: {
            id: 'wompi-id-1',
            status: 'APPROVED',
            reference: 'ref-123',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.post.mockReturnValue(of(wompiApiResponse));

      // Act
      const result = await gateway.createPayment(paymentData);

      // Assert
      expect(result).toEqual({
        id: 'wompi-id-1',
        status: 'APPROVED',
        reference: 'ref-123',
      });
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('should return declined response when Wompi declines', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {
          data: {
            id: 'wompi-id-2',
            status: 'DECLINED',
            reference: 'ref-456',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.post.mockReturnValue(of(wompiApiResponse));

      // Act
      const result = await gateway.createPayment({
        ...paymentData,
        reference: 'ref-456',
      });

      // Assert
      expect(result).toEqual({
        id: 'wompi-id-2',
        status: 'DECLINED',
        reference: 'ref-456',
      });
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('should throw error if Wompi API returns error', async () => {
      // Arrange
      mockHttpService.post.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      // Act & Assert
      await expect(gateway.createPayment(paymentData)).rejects.toThrow(
        'Error en Wompi API: Network error',
      );
    });

    it('should throw error if Wompi API returns malformed data', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.post.mockReturnValue(of(wompiApiResponse));

      // Act & Assert
      await expect(gateway.createPayment(paymentData)).rejects.toThrow();
    });
  });

  describe('getTransactionStatus', () => {
    const transactionId = 'wompi-transaction-123';

    it('should return transaction status when Wompi API returns success', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {
          data: {
            id: transactionId,
            status: 'APPROVED',
            reference: 'ref-123',
            amount_in_cents: 100000,
            currency: 'COP',
            customer_email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            finalized_at: '2024-01-01T00:01:00Z',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.get.mockReturnValue(of(wompiApiResponse));

      // Act
      const result = await gateway.getTransactionStatus(transactionId);

      // Assert
      expect(result).toEqual({
        id: transactionId,
        status: 'APPROVED',
        reference: 'ref-123',
        amount_in_cents: 100000,
        currency: 'COP',
        customer_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        finalized_at: '2024-01-01T00:01:00Z',
      });
      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`/transactions/${transactionId}`),
      );
    });

    it('should return declined transaction status', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {
          data: {
            id: transactionId,
            status: 'DECLINED',
            reference: 'ref-456',
            amount_in_cents: 50000,
            currency: 'COP',
            customer_email: 'test2@example.com',
            created_at: '2024-01-02T00:00:00Z',
            finalized_at: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.get.mockReturnValue(of(wompiApiResponse));

      // Act
      const result = await gateway.getTransactionStatus(transactionId);

      // Assert
      expect(result).toEqual({
        id: transactionId,
        status: 'DECLINED',
        reference: 'ref-456',
        amount_in_cents: 50000,
        currency: 'COP',
        customer_email: 'test2@example.com',
        created_at: '2024-01-02T00:00:00Z',
        finalized_at: null,
      });
    });

    it('should return pending transaction status', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {
          data: {
            id: transactionId,
            status: 'PENDING',
            reference: 'ref-789',
            amount_in_cents: 75000,
            currency: 'COP',
            customer_email: 'test3@example.com',
            created_at: '2024-01-03T00:00:00Z',
            finalized_at: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.get.mockReturnValue(of(wompiApiResponse));

      // Act
      const result = await gateway.getTransactionStatus(transactionId);

      // Assert
      expect(result).toEqual({
        id: transactionId,
        status: 'PENDING',
        reference: 'ref-789',
        amount_in_cents: 75000,
        currency: 'COP',
        customer_email: 'test3@example.com',
        created_at: '2024-01-03T00:00:00Z',
        finalized_at: null,
      });
    });

    it('should throw error if Wompi API returns error', async () => {
      // Arrange
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      // Act & Assert
      await expect(gateway.getTransactionStatus(transactionId)).rejects.toThrow(
        'No se pudo consultar el estado de la transacción en Wompi',
      );
    });

    it('should throw error if Wompi API returns 404', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: { error: 'Transaction not found' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.get.mockReturnValue(
        throwError(() => ({
          response: wompiApiResponse,
          message: 'Not Found',
        })),
      );

      // Act & Assert
      await expect(gateway.getTransactionStatus(transactionId)).rejects.toThrow(
        'No se pudo consultar el estado de la transacción en Wompi',
      );
    });

    it('should throw error if Wompi API returns malformed data', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Malformed data')),
      );

      // Act & Assert
      await expect(gateway.getTransactionStatus(transactionId)).rejects.toThrow(
        'No se pudo consultar el estado de la transacción en Wompi',
      );
    });

    it('should handle missing optional fields gracefully', async () => {
      // Arrange
      const wompiApiResponse: AxiosResponse = {
        data: {
          data: {
            id: transactionId,
            status: 'APPROVED',
            reference: 'ref-123',
            amount_in_cents: 100000,
            currency: 'COP',
            customer_email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            // finalized_at is missing
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as any,
      };
      mockHttpService.get.mockReturnValue(of(wompiApiResponse));

      // Act
      const result = await gateway.getTransactionStatus(transactionId);

      // Assert
      expect(result).toEqual({
        id: transactionId,
        status: 'APPROVED',
        reference: 'ref-123',
        amount_in_cents: 100000,
        currency: 'COP',
        customer_email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      });
    });
  });

  // Puedes agregar más pruebas para otros métodos del gateway si existen
});
