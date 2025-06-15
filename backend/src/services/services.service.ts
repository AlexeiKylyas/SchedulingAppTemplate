import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.servicesRepository.create(createServiceDto);
    return this.servicesRepository.save(service);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    const [services, total] = await this.servicesRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { name: 'ASC' },
      where: { isActive: true },
    });

    return new PaginatedResponseDto<Service>(services, total, paginationDto);
  }

  async findAllAdmin(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    const [services, total] = await this.servicesRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { name: 'ASC' },
    });

    return new PaginatedResponseDto<Service>(services, total, paginationDto);
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.servicesRepository.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);

    Object.assign(service, updateServiceDto);

    return this.servicesRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.servicesRepository.remove(service);
  }

  async findByCategory(category: string, paginationDto: PaginationDto): Promise<PaginatedResponseDto<Service>> {
    const [services, total] = await this.servicesRepository.findAndCount({
      where: { category, isActive: true },
      skip: paginationDto.skip,
      take: paginationDto.limit,
      order: { name: 'ASC' },
    });

    return new PaginatedResponseDto<Service>(services, total, paginationDto);
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
