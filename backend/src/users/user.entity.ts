import { Entity, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../common/base.entity';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CLIENT = 'client',
}

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User first name' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'User phone number' })
  @Column({ nullable: true })
  phoneNumber: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @ApiProperty({ description: 'Whether the user is active' })
  @Column({ default: true })
  isActive: boolean;

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}