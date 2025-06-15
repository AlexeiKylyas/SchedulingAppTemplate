import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../appointment.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { ServiceResponseDto } from '../../services/dto/service-response.dto';

export class AppointmentResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: string;

  @ApiProperty({ description: 'Appointment date and time' })
  dateTime: Date;

  @ApiProperty({ description: 'Appointment end time' })
  endTime: Date;

  @ApiProperty({ enum: AppointmentStatus, description: 'Appointment status' })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Additional notes for the appointment' })
  notes: string;

  @ApiProperty({ description: 'Client ID' })
  clientId: string;

  @ApiProperty({ description: 'Client', type: UserResponseDto })
  client: UserResponseDto;

  @ApiProperty({ description: 'Staff ID' })
  staffId: string;

  @ApiProperty({ description: 'Staff member', type: UserResponseDto })
  staff: UserResponseDto;

  @ApiProperty({ description: 'Service ID' })
  serviceId: string;

  @ApiProperty({ description: 'Service', type: ServiceResponseDto })
  service: ServiceResponseDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}