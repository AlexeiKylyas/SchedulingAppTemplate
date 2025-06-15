import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Service name' })
  name: string;

  @ApiProperty({ description: 'Service description' })
  description: string;

  @ApiProperty({ description: 'Service duration in minutes' })
  durationMinutes: number;

  @ApiProperty({ description: 'Service price' })
  price: number;

  @ApiProperty({ description: 'Whether the service is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Service category' })
  category: string;

  @ApiProperty({ description: 'Service image URL' })
  imageUrl: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}