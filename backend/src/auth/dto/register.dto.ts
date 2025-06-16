import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength, Length } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User phone number', example: '+380636289907' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+380\d{9}$/, { message: 'Phone number must be in format +380XXXXXXXXX' })
  phoneNumber: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'OTP code received via SMS', example: '1111' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'OTP code must be exactly 4 characters' })
  otpCode: string;
}
