import { Injectable, Inject } from '@nestjs/common';
import { IWompiGateway } from '../../domain/gateways/IWompi.gateway';
import { ITransactionRepository } from '../../domain/repositories/ITransaction.repository';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { ICustomerRepository } from '../../domain/repositories/ICustomer.repository';
import { IDeliveryRepository } from '../../domain/repositories/IDelivery.repository';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { Product } from '../../domain/entities/domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Customer } from '../../domain/entities/customer.entity';
import { Delivery } from '../../domain/entities/delivery.entity';

export interface ProcessPaymentWithStockUpdateRequest extends CreatePaymentDto {}

export interface ProcessPaymentWithStockUpdateResponse {
  transaction: Transaction;
  paymentStatus: string;
  stockUpdated: boolean;
}

export class ProcessPaymentWithStockUpdateResult {
  constructor(
    public readonly isSuccess: boolean,
    public readonly value?: ProcessPaymentWithStockUpdateResponse,
    public readonly error?: Error
  ) {}

  static success(value: ProcessPaymentWithStockUpdateResponse): ProcessPaymentWithStockUpdateResult {
    return new ProcessPaymentWithStockUpdateResult(true, value);
  }

  static failure(error: Error): ProcessPaymentWithStockUpdateResult {
    return new ProcessPaymentWithStockUpdateResult(false, undefined, error);
  }
}

@Injectable()
export class ProcessPaymentWithStockUpdateUseCase {
  constructor(
    @Inject(IWompiGateway) private readonly wompiGateway: IWompiGateway,
    @Inject(ITransactionRepository) private readonly transactionRepo: ITransactionRepository,
    @Inject(IProductRepository) private readonly productRepo: IProductRepository,
    @Inject(ICustomerRepository) private readonly customerRepo: ICustomerRepository,
    @Inject(IDeliveryRepository) private readonly deliveryRepo: IDeliveryRepository,
  ) {}

  async execute(request: ProcessPaymentWithStockUpdateRequest): Promise<ProcessPaymentWithStockUpdateResult> {
    try {
      // 1. Verificar que el producto existe y tiene stock
      const product = await this.productRepo.findById(request.productId);
      if (!product) {
        return ProcessPaymentWithStockUpdateResult.failure(new Error('Producto no encontrado'));
      }

      if (!product.hasStock(1)) {
        return ProcessPaymentWithStockUpdateResult.failure(new Error('Stock insuficiente para realizar la compra'));
      }

      // 2. Crear o actualizar customer si se proporcionan datos
      let customer: Customer | null = null;
      if (request.customerData && request.deliveryData) {
        customer = await this.customerRepo.create({
          name: request.customerData.name,
          email: request.customerData.email,
          phone: request.customerData.phone,
          address: {
            street: request.deliveryData.address,
            city: request.deliveryData.city,
            state: request.deliveryData.state,
            zipCode: request.deliveryData.zipCode,
            country: request.deliveryData.country,
          },
        });
      }

      // 3. Crear la transacción inicial
      const transaction = await this.transactionRepo.create({
        productId: request.productId,
        reference: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amountInCents: product.price * 100,
        status: 'PENDING',
        customerEmail: request.customerEmail,
      });

      // 4. Crear delivery si se proporcionan datos
      let delivery: Delivery | null = null;
      if (request.deliveryData && customer) {
        delivery = await this.deliveryRepo.create({
          transactionId: transaction.id,
          customerId: customer.id,
          status: 'PENDING',
          estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          address: {
            street: request.deliveryData.address,
            city: request.deliveryData.city,
            state: request.deliveryData.state,
            zipCode: request.deliveryData.zipCode,
            country: request.deliveryData.country,
          },
          notes: 'Entrega estándar',
        });
      }

      // 5. Procesar el pago con Wompi
      const paymentResponse = await this.wompiGateway.createPayment({
        amountInCents: transaction.amountInCents,
        currency: 'COP',
        customerEmail: request.customerEmail,
        reference: transaction.reference,
        paymentMethod: {
          type: 'CARD',
          token: request.creditCardToken,
          installments: request.installments,
        },
      });

      // 6. Actualizar la transacción con el ID de Wompi
      await this.transactionRepo.updateStatus(
        transaction.id,
        paymentResponse.status as any,
      );

      // 7. Verificar el estado del pago después de un breve delay
      await this.delay(2000); // Esperar 2 segundos para que Wompi procese

      const paymentStatus = await this.wompiGateway.getTransactionStatus(paymentResponse.id);
      
      // 8. Actualizar la transacción con el estado final
      const updatedTransaction = await this.transactionRepo.updateStatus(
        transaction.id,
        paymentStatus.status as any,
      );

      let stockUpdated = false;

      // 9. Si el pago fue aprobado, reducir el stock
      if (paymentStatus.status === 'APPROVED') {
        await this.productRepo.decreaseStock(request.productId, 1);
        stockUpdated = true;
      }

      return ProcessPaymentWithStockUpdateResult.success({
        transaction: updatedTransaction,
        paymentStatus: paymentStatus.status,
        stockUpdated,
      });

    } catch (error) {
      // Manejo específico de errores de Wompi
      let userFriendlyMessage = 'Error al procesar el pago';
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('acceptance_token') || errorMessage.includes('ya fue usado')) {
          userFriendlyMessage = 'Esta tarjeta ya fue utilizada para un pago anterior. Por favor, usa una tarjeta diferente o espera unos minutos.';
        } else if (errorMessage.includes('insufficient_funds') || errorMessage.includes('fondos insuficientes')) {
          userFriendlyMessage = 'La tarjeta no tiene fondos suficientes para completar la transacción.';
        } else if (errorMessage.includes('invalid_card') || errorMessage.includes('tarjeta inválida')) {
          userFriendlyMessage = 'Los datos de la tarjeta son incorrectos. Por favor, verifica la información.';
        } else if (errorMessage.includes('expired_card') || errorMessage.includes('tarjeta expirada')) {
          userFriendlyMessage = 'La tarjeta ha expirado. Por favor, usa una tarjeta válida.';
        } else if (errorMessage.includes('declined') || errorMessage.includes('rechazada')) {
          userFriendlyMessage = 'La transacción fue rechazada por el banco. Por favor, intenta con otra tarjeta.';
        } else if (errorMessage.includes('network') || errorMessage.includes('conexión')) {
          userFriendlyMessage = 'Error de conexión. Por favor, verifica tu internet e intenta nuevamente.';
        } else if (errorMessage.includes('token') || errorMessage.includes('invalid_token')) {
          userFriendlyMessage = 'Error al validar la tarjeta. Por favor, verifica los datos de la tarjeta e intenta nuevamente.';
        } else if (errorMessage.includes('422') || errorMessage.includes('validation')) {
          userFriendlyMessage = 'Los datos de la tarjeta no son válidos. Por favor, verifica la información e intenta nuevamente.';
        }
      }

      // Si hay error, marcar la transacción como DECLINED
      if (request.productId) {
        try {
          const transaction = await this.transactionRepo.create({
            productId: request.productId,
            reference: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amountInCents: 0,
            status: 'DECLINED',
            customerEmail: request.customerEmail,
          });
        } catch (createError) {
          // Ignorar error al crear transacción de fallback
        }
      }

      return ProcessPaymentWithStockUpdateResult.failure(new Error(userFriendlyMessage));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 