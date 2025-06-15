import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, description: 'User role', required: false, default: UserRole.CLIENT })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.CLIENT;
}