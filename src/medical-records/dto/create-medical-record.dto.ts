import { IsString, IsDateString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsDateString()
  date: string;

  @IsString()
  @MaxLength(500)
  diagnosis: string;

  @IsString()
  treatment: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}
