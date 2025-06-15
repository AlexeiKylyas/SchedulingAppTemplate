import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

export class UpdateAppointmentDto {
  @ApiProperty({ description: 'Appointment date and time', example: '2023-06-15T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  dateTime?: string;

  @ApiProperty({ description: 'Additional notes for the appointment', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Staff ID', required: false })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ description: 'Service ID', required: false })
  @IsUUID()
  @IsOptional()
  serviceId?: string;

  @ApiProperty({ enum: AppointmentStatus, description: 'Appointment status', required: false })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;
}