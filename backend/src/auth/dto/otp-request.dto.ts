import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OtpRequestDto {
  @ApiProperty({ description: 'User phone number', example: '+380636289907' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+380\d{9}$/, { message: 'Phone number must be in format +380XXXXXXXXX' })
  phoneNumber: string;
}