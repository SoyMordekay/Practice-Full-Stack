import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { ProcessPaymentWithStockUpdateUseCase } from '../../application/use-cases/process-payment-with-stock-update.usecase';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';

interface ProcessPaymentRequest {
  productId: string;
  customerEmail: string;
  creditCardToken: string;
  installments: number;
  customerData?: {
    name: string;
    email: string;
    phone: string;
  };
  deliveryData?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    customerEmail: string;
  };
}

@ApiTags('Pagos')
@Controller('payment')
export class PaymentWithStockController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentWithStockUpdateUseCase,
  ) {}

  @Post('process-with-stock')
  @ApiOperation({ summary: 'Procesar pago y actualizar stock' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Pago procesado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al procesar el pago' })
  async processPaymentWithStock(@Body() request: CreatePaymentDto) {
    try {
      const result = await this.processPaymentUseCase.execute(request);

      if (result.isSuccess) {
        return {
          success: true,
          data: result.value,
          message: 'Pago procesado exitosamente',
        };
      } else {
        const error = result.error;
        throw new HttpException(
          {
            success: false,
            message: error?.message || 'Error al procesar el pago',
            error: 'PAYMENT_PROCESSING_ERROR',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      // Si ya es un HttpException, re-lanzarlo
      if (error instanceof HttpException) {
        throw error;
      }

      // Para otros errores, crear una respuesta amigable
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Error interno del servidor';

      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('producto no encontrado')) {
          statusCode = HttpStatus.NOT_FOUND;
          message = 'El producto solicitado no existe';
        } else if (errorMessage.includes('stock insuficiente')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'No hay suficiente stock disponible para este producto';
        } else if (errorMessage.includes('tarjeta ya fue utilizada')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Esta tarjeta ya fue utilizada para un pago anterior. Por favor, usa una tarjeta diferente.';
        } else if (errorMessage.includes('fondos insuficientes')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'La tarjeta no tiene fondos suficientes para completar la transacción';
        } else if (errorMessage.includes('datos de la tarjeta')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Los datos de la tarjeta son incorrectos. Por favor, verifica la información';
        } else if (errorMessage.includes('tarjeta expirada')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'La tarjeta ha expirado. Por favor, usa una tarjeta válida';
        } else if (errorMessage.includes('rechazada')) {
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'La transacción fue rechazada por el banco. Por favor, intenta con otra tarjeta';
        } else if (errorMessage.includes('conexión')) {
          statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          message = 'Error de conexión con el proveedor de pagos. Por favor, intenta más tarde';
        }
      }

      throw new HttpException(
        {
          success: false,
          message,
          error: 'PAYMENT_ERROR',
        },
        statusCode,
      );
    }
  }
} 