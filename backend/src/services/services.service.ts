import { Injectable } from '@nestjs/common';
import { Service } from './service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto';
import { PaginationDto, PaginatedResponseDto } from '../common';
import { ServicesRepository } from './services.repository';

@Injectable()
export class ServicesService {
  constructor(
    private servicesRepository: ServicesRepository,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    return this.servicesRepository.create(createServiceDto);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.servicesRepository.findAllActive(paginationDto);
  }

  async findAllAdmin(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.servicesRepository.findAll(paginationDto, { order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Service> {
    return this.servicesRepository.findOne(id);
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    return this.servicesRepository.update(id, updateServiceDto);
  }

  async remove(id: string): Promise<void> {
    await this.servicesRepository.remove(id);
  }

  async findByCategory(category: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    return this.servicesRepository.findByCategory(category, paginationDto);
  }

  async getCategories(): Promise<string[]> {
    return this.servicesRepository.getCategories();
  }
}
