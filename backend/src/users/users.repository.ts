import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { BaseRepository } from '../common/base.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with this email already exists
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // If updating email, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already taken');
      }
    }
    
    // If updating password, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    
    // Update user
    Object.assign(user, updateUserDto);
    
    return this.usersRepository.save(user);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}