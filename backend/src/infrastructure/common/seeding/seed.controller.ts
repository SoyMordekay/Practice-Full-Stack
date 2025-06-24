import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('products')
  async seedProducts() {
    await this.seedService.seedProducts();
    return { success: true, message: 'Productos de ejemplo insertados correctamente.' };
  }
} 