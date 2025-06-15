import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<JwtResponseDto> {
    // Create user with CLIENT role
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.CLIENT,
    });

    // Generate JWT token
    const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };
  }

  async login(loginDto: LoginDto): Promise<JwtResponseDto> {
    const user = await this.usersService.findByPhoneNumber(loginDto.phoneNumber);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };

    return {
      accessToken: this.jwtService.sign(payload),
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };
  }
}
