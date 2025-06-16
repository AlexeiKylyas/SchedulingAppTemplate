import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, JwtResponseDto, OtpRequestDto, OtpResponseDto } from './dto';

@ApiTags('auth')
@ApiBearerAuth('JWT-auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User has been successfully registered',
    type: JwtResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<JwtResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User has been successfully logged in',
    type: JwtResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(@Body() loginDto: LoginDto): Promise<JwtResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens have been successfully refreshed',
    type: JwtResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid refresh token',
  })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto): Promise<JwtResponseDto> {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('generate-otp')
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
    return this.authService.generateOtp(otpRequestDto);
  }
}
