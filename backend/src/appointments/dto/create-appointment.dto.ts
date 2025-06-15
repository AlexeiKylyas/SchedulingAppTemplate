import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Appointment date and time', example: '2023-06-15T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  dateTime: string;

  @ApiProperty({ description: 'Additional notes for the appointment', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Client ID' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Staff ID', required: false })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ description: 'Service ID' })
  @IsUUID()
  @IsNotEmpty()
  serviceId: string;
}