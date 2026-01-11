import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { MedicalRecordFile } from '../medical-records/entities/medical-record-file.entity';
import { Notification } from '../notifications/entities/notification.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'docflow_schedule',
  entities: [Patient, Appointment, MedicalRecord, MedicalRecordFile, Notification],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
