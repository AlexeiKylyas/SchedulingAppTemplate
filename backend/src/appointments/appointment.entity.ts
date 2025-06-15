import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';
import { Service } from '../services/service.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('appointments')
export class Appointment extends BaseEntity {
  @ApiProperty({ description: 'Appointment date and time' })
  @Column({ type: 'timestamp' })
  dateTime: Date;

  @ApiProperty({ description: 'Appointment end time' })
  @Column({ type: 'timestamp' })
  endTime: Date;

  @ApiProperty({ enum: AppointmentStatus, description: 'Appointment status' })
  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Additional notes for the appointment' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Client ID' })
  @Column()
  clientId: string;

  @ApiProperty({ description: 'Client', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ApiProperty({ description: 'Staff ID' })
  @Column({ nullable: true })
  staffId: string;

  @ApiProperty({ description: 'Staff member', type: () => User })
  @ManyToOne(() => User)
  @JoinColumn({ name: 'staffId' })
  staff: User;

  @ApiProperty({ description: 'Service ID' })
  @Column()
  serviceId: string;

  @ApiProperty({ description: 'Service', type: () => Service })
  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}