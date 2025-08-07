import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../common/base.entity';

@Entity('otps')
export class Otp extends BaseEntity {
  @ApiProperty({ description: 'Phone number the OTP was sent to' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ description: 'OTP code' })
  @Column()
  code: string;

  @ApiProperty({ description: 'Expiration timestamp' })
  @Column({ type: 'timestamp' })
  expiredAt: Date;

  @ApiProperty({ description: 'Whether the OTP has been used' })
  @Column({ default: false })
  isUsed: boolean;

  // Helper method to check if the OTP is expired
  isExpired(): boolean {
    return new Date() > this.expiredAt;
  }

  // Helper method to check if the OTP is valid
  isValid(code: string): boolean {
    return !this.isUsed && !this.isExpired() && this.code === code;
  }
}