import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/user.entity';

export class JwtResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token with 30 days expiration' })
  refreshToken: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User phone number' })
  phoneNumber: string;

  @ApiProperty({ description: 'User email', required: false })
  email?: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  role: UserRole;
}
