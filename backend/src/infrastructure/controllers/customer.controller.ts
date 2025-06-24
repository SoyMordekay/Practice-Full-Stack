import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCustomerUseCase } from '../../application/use-cases/customer/create-customer.usecase';
import { GetAllCustomersUseCase } from '../../application/use-cases/customer/get-all-customers.usecase';
import { GetCustomerByIdUseCase } from '../../application/use-cases/customer/get-customer-by-id.usecase';
import { UpdateCustomerUseCase } from '../../application/use-cases/customer/update-customer.usecase';
import { DeleteCustomerUseCase } from '../../application/use-cases/customer/delete-customer.usecase';
import { CreateCustomerRequest } from '../../application/use-cases/customer/create-customer.usecase';
import { UpdateCustomerRequest } from '../../application/use-cases/customer/update-customer.usecase';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getAllCustomersUseCase: GetAllCustomersUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase
  ) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerRequest) {
    const result = await this.createCustomerUseCase.execute(createCustomerDto);
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to create customer', HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  async findAll() {
    const result = await this.getAllCustomersUseCase.execute();
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to get customers', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async findOne(@Param('id') id: string) {
    const result = await this.getCustomerByIdUseCase.execute({ id });
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Customer not found', HttpStatus.NOT_FOUND);
    }
    return result.value;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    const result = await this.updateCustomerUseCase.execute({ id, data: updateCustomerDto });
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to update customer', HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.deleteCustomerUseCase.execute({ id });
    if (!result.isSuccess) {
      throw new HttpException(result.error?.message || 'Failed to delete customer', HttpStatus.BAD_REQUEST);
    }
    return result.value;
  }
} 