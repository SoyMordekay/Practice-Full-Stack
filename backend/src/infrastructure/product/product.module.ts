import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';
import { ProductRepositoryPg } from '../persistence/postgres/repositories/product.repository';
import { ProductOrmEntity } from '../persistence/postgres/entities/product.orm-entity';
import { ProductController } from '../controllers/product.controller';
import { SeedService } from '../common/seeding/seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    SeedService,
    {
      provide: IProductRepository,
      useClass: ProductRepositoryPg,
    },
  ],
  exports: [IProductRepository],
})
export class ProductModule {}