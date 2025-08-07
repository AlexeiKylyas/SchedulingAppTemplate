import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, JwtResponseDto, RefreshTokenDto, OtpRequestDto, OtpResponseDto } from './dto';
import {User, UserRole} from '../users/user.entity';
import { UsersRepository } from '../users/users.repository';
import { OtpRepository } from '../otp/repositories/otp.repository';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private usersRepository: UsersRepository,
    private otpRepository: OtpRepository,
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
    const { otpCode, phoneNumber, ...userData } = registerDto;

    // Validate OTP code
    const otp = await this.otpRepository.findValidOtp(phoneNumber, otpCode);
    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // Mark OTP as used
    await this.otpRepository.markAsUsed(otp.id);

    // Create user
    const user = await this.usersService.create({
      phoneNumber,
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

    // Generate a random 4-digit OTP code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP in database with 5-minute expiration
    await this.otpRepository.createOtp(otpRequestDto.phoneNumber, otpCode, 5);

    // In a real application, you would send the OTP via SMS here
    // For development purposes, we'll return the OTP in the response
    return {
      otpCode,
      phoneNumber: otpRequestDto.phoneNumber,
    };
  }
}
