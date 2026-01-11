import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { Patient } from './patients/entities/patient.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { MedicalRecord } from './medical-records/entities/medical-record.entity';
import { MedicalRecordFile } from './medical-records/entities/medical-record-file.entity';
import { Notification } from './notifications/entities/notification.entity';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Database configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'docflow_schedule',
      entities: [Patient, Appointment, MedicalRecord, MedicalRecordFile, Notification],
      synchronize: process.env.NODE_ENV === 'development', // Only in development
      logging: process.env.NODE_ENV === 'development',
    }),
    // Feature modules
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    NotificationsModule,
    DashboardModule,
  ],
})
export class AppModule {}
