import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ description: 'Service name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Service description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Service duration in minutes', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ description: 'Service price', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'Whether the service is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Service category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Service image URL', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}