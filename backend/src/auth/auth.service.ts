import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, JwtResponseDto, RefreshTokenDto, OtpRequestDto, OtpResponseDto } from './dto';
import {User, UserRole} from '../users/user.entity';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
  ) {}

  private generateTokens(user: any) {
    const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<JwtResponseDto> {
    if (registerDto.otpCode !== '1111') {
      throw new BadRequestException('Invalid OTP code');
    }

    const { otpCode, ...userData } = registerDto;
    const user = await this.usersService.create({
      ...userData,
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
    const user: User = await this.usersRepository.findOneBy({ phoneNumber: loginDto.phoneNumber });

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
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      const user = await this.usersRepository.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
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
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async generateOtp(otpRequestDto: OtpRequestDto): Promise<OtpResponseDto> {
    const user = await this.usersRepository.findOneBy({ phoneNumber: otpRequestDto.phoneNumber });

    if (user) {
      throw new ConflictException('User with this phone number already exists');
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    return {
      otpCode,
      phoneNumber: otpRequestDto.phoneNumber,
    };
  }
}
