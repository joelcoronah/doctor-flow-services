import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('api/medical-records')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string, @CurrentUser() user: User) {
    return this.medicalRecordsService.findByPatient(patientId, user.id);
  }

  @Post('patient/:patientId')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('patientId') patientId: string,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.create(patientId, createMedicalRecordDto, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.medicalRecordsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @CurrentUser() user: User,
  ) {
    return this.medicalRecordsService.update(id, updateMedicalRecordDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.medicalRecordsService.remove(id, user.id);
  }
}
