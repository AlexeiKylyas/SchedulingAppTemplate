import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Service } from './service.entity';
import { BaseRepository } from '../common/base.repository';
import { PaginationDto, PaginatedResponseDto } from '../common/pagination.dto';

@Injectable()
export class ServicesRepository extends BaseRepository<Service> {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {
    super(servicesRepository);
  }

  async findAllActive(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.findBy({ isActive: true }, paginationDto, { order: { name: 'ASC' } });
  }

  async findByCategory(category: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.findBy(
      { category, isActive: true }, 
      paginationDto, 
      { order: { name: 'ASC' } }
    );
  }

  async getCategories(): Promise<string[]> {
    const services = await this.servicesRepository.find({
      select: ['category'],
      where: { isActive: true },
    });

    // Handle distinct operation in JavaScript
    const categories = services
      .map(service => service.category)
      .filter(category => category !== null && category !== undefined);

    // Remove duplicates using Set
    return [...new Set(categories)];
  }
}