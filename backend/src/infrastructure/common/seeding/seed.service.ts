import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/IProduct.repository';
import { Product } from '../../../domain/entities/domain/entities/product.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(IProductRepository)
    private readonly productRepo: IProductRepository,
  ) {}

  async onModuleInit() {
    await this.seedProducts();
  }

  private async seedProducts() {
    const products = await this.productRepo.findAll();
    if (products.length > 0) {
      this.logger.log('Database already seeded with products. Skipping.');
      return;
    }

    this.logger.log('Seeding products...');
    const productsToCreate: Partial<Product>[] = [
      {
        name: 'T-Shirt "Code Life"',
        description: 'La camiseta perfecta para largas noches de codificación.',
        price: 25000, 
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Code+Life+T-Shirt',
      },
      {
        name: 'Taza "Hello World"',
        description: 'Empieza tu día con el clásico saludo de todo programador.',
        price: 15000,
        stock: 100,
        imageUrl: 'https://via.placeholder.com/300x300.png?text=Hello+World+Mug',
      },
    ];

    for (const product of productsToCreate) {
      await this.productRepo.save(product);
    }
    this.logger.log('Seeding completed.');
  }
}