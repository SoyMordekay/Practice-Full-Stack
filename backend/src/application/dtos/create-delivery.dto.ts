import { IsString, IsNotEmpty, IsDateString, IsOptional, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveryAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

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
}

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsIn(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED'])
  status: string;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsDateString()
  estimatedDeliveryDate: string;

  @IsDateString()
  @IsOptional()
  actualDeliveryDate?: string;

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  address: DeliveryAddressDto;

  @IsString()
  @IsOptional()
  notes?: string;
} 