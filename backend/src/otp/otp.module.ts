import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { OtpRepository } from './repositories/otp.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),
  ],
  providers: [OtpRepository],
  exports: [OtpRepository],
})
export class OtpModule {}