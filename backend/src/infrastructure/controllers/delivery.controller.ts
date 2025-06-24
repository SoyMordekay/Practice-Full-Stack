import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CreateDeliveryUseCase } from '../../application/use-cases/delivery/create-delivery.usecase';
import { GetAllDeliveriesUseCase } from '../../application/use-cases/delivery/get-all-deliveries.usecase';
import { GetDeliveryByIdUseCase } from '../../application/use-cases/delivery/get-delivery-by-id.usecase';
import { UpdateDeliveryUseCase } from '../../application/use-cases/delivery/update-delivery.usecase';
import { DeleteDeliveryUseCase } from '../../application/use-cases/delivery/delete-delivery.usecase';
import { CreateDeliveryRequest } from '../../application/use-cases/delivery/create-delivery.usecase';
import { UpdateDeliveryRequest } from '../../application/use-cases/delivery/update-delivery.usecase';

@Controller('deliveries')
export class DeliveryController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly getAllDeliveriesUseCase: GetAllDeliveriesUseCase,
    private readonly getDeliveryByIdUseCase: GetDeliveryByIdUseCase,
    private readonly updateDeliveryUseCase: UpdateDeliveryUseCase,
    private readonly deleteDeliveryUseCase: DeleteDeliveryUseCase,
  ) {}

  @Post()
  async create(@Body() createDeliveryDto: CreateDeliveryRequest) {
    const result = await this.createDeliveryUseCase.execute(createDeliveryDto);
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to create delivery', HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Get()
  async findAll() {
    const result = await this.getAllDeliveriesUseCase.execute();
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to get deliveries', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.value;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.getDeliveryByIdUseCase.execute({ id });
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Delivery not found', HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDeliveryDto: any) {
    const result = await this.updateDeliveryUseCase.execute({ id, data: updateDeliveryDto });
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to update delivery', HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.deleteDeliveryUseCase.execute({ id });
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to delete delivery', HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }
} 