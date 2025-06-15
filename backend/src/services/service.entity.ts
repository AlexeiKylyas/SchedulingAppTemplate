import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';

@Entity('services')
export class Service extends BaseEntity {
  @ApiProperty({ description: 'Service name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Service description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Service duration in minutes' })
  @Column()
  durationMinutes: number;

  @ApiProperty({ description: 'Service price' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ description: 'Whether the service is active' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Service category' })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({ description: 'Service image URL' })
  @Column({ nullable: true })
  imageUrl: string;
}