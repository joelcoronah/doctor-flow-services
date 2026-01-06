import {
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentType, AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(180)
  duration?: number = 30;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType = AppointmentType.CHECKUP;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.SCHEDULED;

  @IsOptional()
  @IsString()
  notes?: string;
}
