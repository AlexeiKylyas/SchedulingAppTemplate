import { Repository, FindOptionsWhere, FindManyOptions, FindOneOptions } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from './base.entity';
import { PaginationDto, PaginatedResponseDto } from './pagination.dto';

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(createDto: any): Promise<T> {
    const entity = this.repository.create(createDto);
    const savedEntity = await this.repository.save(entity);
    return Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
  }

  async findAll(paginationDto: PaginationDto, options?: FindManyOptions<T>): Promise<PaginatedResponseDto<T>> {
    const findOptions: FindManyOptions<T> = {
      skip: paginationDto.skip,
      take: paginationDto.limit,
      ...options
    };

    const [entities, total] = await this.repository.findAndCount(findOptions);
    return new PaginatedResponseDto<T>(entities, total, paginationDto);
  }

  async findOne(id: string, options?: FindOneOptions<T>): Promise<T> {
    const findOptions: FindOneOptions<T> = {
      where: { id } as FindOptionsWhere<T>,
      ...options
    };

    const entity = await this.repository.findOne(findOptions);

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return entity;
  }

  async update(id: string, updateDto: any): Promise<T> {
    const entity = await this.findOne(id);

    Object.assign(entity, updateDto);

    const savedEntity = await this.repository.save(entity);
    return Array.isArray(savedEntity) ? savedEntity[0] : savedEntity;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.remove(entity);
  }

  async findBy(where: FindOptionsWhere<T>, paginationDto: PaginationDto, options?: FindManyOptions<T>): Promise<PaginatedResponseDto<T>> {
    const findOptions: FindManyOptions<T> = {
      where,
      skip: paginationDto.skip,
      take: paginationDto.limit,
      ...options
    };

    const [entities, total] = await this.repository.findAndCount(findOptions);
    return new PaginatedResponseDto<T>(entities, total, paginationDto);
  }

  async findOneBy(where: FindOptionsWhere<T>, options?: FindOneOptions<T>): Promise<T | null> {
    const findOptions: FindOneOptions<T> = {
      where,
      ...options
    };

    return this.repository.findOne(findOptions);
  }

  async count(where: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }
}
