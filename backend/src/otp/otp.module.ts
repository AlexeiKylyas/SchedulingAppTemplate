import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { OtpRepository } from './repositories/otp.repository';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),
    UsersModule,
  ],
  controllers: [OtpController],
  providers: [OtpRepository, OtpService],
  exports: [OtpRepository, OtpService],
})
export class OtpModule {}
