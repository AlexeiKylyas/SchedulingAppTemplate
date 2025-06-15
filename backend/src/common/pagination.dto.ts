import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    default: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    default: 10,
    required: false,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'List of items' })
  items: T[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  pages: number;

  constructor(items: T[], total: number, paginationDto: PaginationDto) {
    this.items = items;
    this.total = total;
    this.page = paginationDto.page;
    this.limit = paginationDto.limit;
    this.pages = Math.ceil(total / paginationDto.limit);
  }
}