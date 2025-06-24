import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { GetTransactionStatusUseCase } from '../../application/use-cases/get-transaction-status.usecase';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionStatusUseCase: GetTransactionStatusUseCase,
  ) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const result = await this.processPaymentUseCase.execute(createPaymentDto);

    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':transactionId/status')
  async getTransactionStatus(@Param('transactionId') transactionId: string) {
    const result = await this.getTransactionStatusUseCase.execute({
      transactionId,
    });

    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(
        result.error?.message ||
          'Error al consultar el estado de la transacción',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
