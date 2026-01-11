import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  profilePhoto?: string;

  @IsEnum(['email', 'google', 'facebook'])
  @IsOptional()
  provider?: 'email' | 'google' | 'facebook';

  @IsEnum(['doctor', 'admin'])
  @IsOptional()
  role?: 'doctor' | 'admin';
}
