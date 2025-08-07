import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { OtpRequestDto, OtpResponseDto } from './dto';

@ApiTags('otp')
@ApiBearerAuth('JWT-auth')
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate OTP code for phone number' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP code has been successfully generated',
    type: OtpResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this phone number already exists',
  })
  async generateOtp(@Body() otpRequestDto: OtpRequestDto): Promise<OtpResponseDto> {
    return this.otpService.generateOtp(otpRequestDto);
  }
}