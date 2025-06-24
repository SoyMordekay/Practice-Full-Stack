import { Controller, Get, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';

@Controller('products')
export class ProductController {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepo: IProductRepository,
  ) {}

  @Get()
  async findAll() {
    return this.productRepo.findAll();
  }
}