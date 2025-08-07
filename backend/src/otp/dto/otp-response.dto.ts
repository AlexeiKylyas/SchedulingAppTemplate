import { ApiProperty } from '@nestjs/swagger';

export class OtpResponseDto {
  @ApiProperty({ description: 'Phone number the OTP was sent to', example: '+380636289907' })
  phoneNumber: string;
}