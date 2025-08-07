import { Injectable, ConflictException } from '@nestjs/common';
import { OtpRepository } from './repositories/otp.repository';
import { UsersRepository } from '../users/users.repository';
import { OtpRequestDto, OtpResponseDto } from './dto';

@Injectable()
export class OtpService {
  constructor(
    private otpRepository: OtpRepository,
    private usersRepository: UsersRepository,
  ) {}

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
    // For development purposes, we'll log the OTP to the console
    console.log(`OTP code for ${otpRequestDto.phoneNumber}: ${otpCode}`);

    // Return only the phone number, not the OTP code
    return {
      phoneNumber: otpRequestDto.phoneNumber,
    };
  }
}