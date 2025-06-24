import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentModule } from './payment/payment.module';
import { ProductModule } from './product/product.module';
import { CustomerModule } from './customer/customer.module';
import { DeliveryModule } from './delivery/delivery.module';
import { SeedController } from './common/seeding/seed.controller';
import { SeedService } from './common/seeding/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    PaymentModule,
    ProductModule,
    CustomerModule,
    DeliveryModule,
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class AppModule {}
