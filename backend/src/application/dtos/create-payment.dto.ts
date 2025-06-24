import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class CustomerDataDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

class DeliveryDataDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsEmail()
  customerEmail: string;
}

export class CreatePaymentDto {
  @ApiProperty({ example: '01cf41c6-ab6f-4cc2-b80f-5cc4b7792f31', description: 'ID del producto a comprar' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'cliente@email.com', description: 'Email del cliente' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: 'tok_stagtest_5113_...', description: 'Token de la tarjeta generado por Wompi' })
  @IsString()
  @IsNotEmpty()
  creditCardToken: string;

  @ApiProperty({ example: 1, description: 'Cantidad de cuotas' })
  @IsNumber()
  installments: number;

  @ApiPropertyOptional({
    example: {
      name: 'María García',
      email: 'maria.garcia@test.com',
      phone: '3101234567',
    },
    description: 'Datos del cliente',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDataDto)
  customerData?: CustomerDataDto;

  @ApiPropertyOptional({
    example: {
      address: 'Calle 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '11001',
      country: 'Colombia',
      customerEmail: 'maria.garcia@test.com',
    },
    description: 'Datos de entrega',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryDataDto)
  deliveryData?: DeliveryDataDto;
} 