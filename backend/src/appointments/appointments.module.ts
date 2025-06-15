import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users/users.module';
import { ServicesModule } from '../services/services.module';
import { AppointmentsRepository } from './appointments.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment]),
    UsersModule,
    ServicesModule,
  ],
  providers: [AppointmentsService, AppointmentsRepository],
  controllers: [AppointmentsController],
  exports: [AppointmentsService, AppointmentsRepository],
})
export class AppointmentsModule {}
