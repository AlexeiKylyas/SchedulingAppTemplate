import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PaginationDto, PaginatedResponseDto } from '../common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.usersRepository.create(createUserDto);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<User>> {
    return this.usersRepository.findAll(paginationDto, { order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    return this.usersRepository.findOne(id);
  }


  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.remove(id);
  }
}
