import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.usecase';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly processPaymentUseCase: ProcessPaymentUseCase) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const result = await this.processPaymentUseCase.execute(createPaymentDto);

    if (result.isSuccess) {
      return result.value;
    } else {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
  }
}