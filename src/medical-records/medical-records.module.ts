import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from './entities/medical-record.entity';
import { MedicalRecordFile } from './entities/medical-record-file.entity';
import { MedicalRecordFilesService } from './medical-record-files.service';
import { MedicalRecordFilesController } from './medical-record-files.controller';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicalRecord, MedicalRecordFile]),
    PatientsModule,
  ],
  controllers: [MedicalRecordsController, MedicalRecordFilesController],
  providers: [MedicalRecordsService, MedicalRecordFilesService],
  exports: [MedicalRecordsService, MedicalRecordFilesService],
})
export class MedicalRecordsModule {}
