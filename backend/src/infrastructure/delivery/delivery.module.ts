import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDeliveryRepository } from '../../domain/repositories/IDelivery.repository';
import { DeliveryRepository } from '../persistence/postgres/repositories/delivery.repository';
import { DeliveryOrmEntity } from '../persistence/postgres/entities/delivery.orm-entity';
import { DeliveryController } from '../controllers/delivery.controller';
import { CreateDeliveryUseCase } from '../../application/use-cases/delivery/create-delivery.usecase';
import { GetAllDeliveriesUseCase } from '../../application/use-cases/delivery/get-all-deliveries.usecase';
import { GetDeliveryByIdUseCase } from '../../application/use-cases/delivery/get-delivery-by-id.usecase';
import { UpdateDeliveryUseCase } from '../../application/use-cases/delivery/update-delivery.usecase';
import { DeleteDeliveryUseCase } from '../../application/use-cases/delivery/delete-delivery.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryOrmEntity])],
  controllers: [DeliveryController],
  providers: [
    {
      provide: IDeliveryRepository,
      useClass: DeliveryRepository,
    },
    CreateDeliveryUseCase,
    GetAllDeliveriesUseCase,
    GetDeliveryByIdUseCase,
    UpdateDeliveryUseCase,
    DeleteDeliveryUseCase,
  ],
  exports: [IDeliveryRepository],
})
export class DeliveryModule {} 