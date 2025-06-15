import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Service description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Service duration in minutes' })
  @IsNumber()
  @Min(1)
  durationMinutes: number;

  @ApiProperty({ description: 'Service price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Service category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Service image URL', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}