import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IProductRepository } from '../../domain/repositories/IProduct.repository';

@ApiTags('Productos')
@Controller('products')
export class ProductController {
  constructor(
    @Inject(IProductRepository)
    private readonly productRepo: IProductRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  async findAll() {
    return this.productRepo.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.productRepo.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  async create(@Body() createProductDto) {
    return this.productRepo.save(createProductDto);
  }
}
