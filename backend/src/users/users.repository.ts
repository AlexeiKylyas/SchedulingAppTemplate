import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { BaseRepository } from '../common/base.repository';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super(usersRepository);
  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with this phone number already exists
    const existingUser = await this.findOneBy({ phoneNumber: createUserDto.phoneNumber });

    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
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

    // If updating phone number, check if it's already taken
    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
      const existingUser = await this.findOneBy({ phoneNumber: updateUserDto.phoneNumber });
      if (existingUser) {
        throw new ConflictException('Phone number is already taken');
      }
    }

    // If updating email, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findOneBy({ email: updateUserDto.email });
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
