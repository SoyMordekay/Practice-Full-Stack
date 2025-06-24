import { Injectable } from '@nestjs/common';
import { IProductRepository } from '../../../domain/repositories/IProduct.repository';
import { Product } from '../../../domain/entities/domain/entities/product.entity';

@Injectable()
export class SeedService {
  constructor(private readonly productRepository: IProductRepository) {}

  async seedProducts(): Promise<void> {
    const products: Partial<Product>[] = [
      {
        name: 'Laptop Gaming',
        description: 'Potente laptop para gaming con gráficos dedicados',
        price: 2500000,
        stock: 10,
        imageUrl:
          'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
      },
      {
        name: 'Smartphone Pro',
        description: 'Smartphone de última generación con cámara profesional',
        price: 1200000,
        stock: 15,
        imageUrl:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      },
      {
        name: 'Auriculares Wireless',
        description: 'Auriculares bluetooth con cancelación de ruido',
        price: 350000,
        stock: 25,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
      {
        name: 'Tablet Ultra',
        description: 'Tablet premium con pantalla de alta resolución',
        price: 1800000,
        stock: 8,
        imageUrl:
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
      },
      {
        name: 'Smartwatch Sport',
        description: 'Reloj inteligente con GPS y monitoreo de salud',
        price: 450000,
        stock: 20,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      },
    ];

    for (const productData of products) {
      await this.productRepository.save(productData);
    }
  }
}
