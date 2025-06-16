import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserRole } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateTokens(user: any) {
    const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };

    // Generate access token with default expiration (from config)
    const accessToken = this.jwtService.sign(payload);

    // Generate refresh token with 30 days expiration
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<JwtResponseDto> {
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.CLIENT,
    });

    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
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

    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<JwtResponseDto> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Get the user from the database
      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      return {
        accessToken,
        refreshToken,
        userId: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
