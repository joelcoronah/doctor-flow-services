import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { MedicalRecordFile } from '../medical-records/entities/medical-record-file.entity';
import { Notification } from '../notifications/entities/notification.entity';

// Load .env only when present (e.g. local dev). In Docker, env comes from the container; do not override.
config({ path: '.env', override: false });

const port = Number(process.env.DB_PORT) || 5432;

// Use .js when running from dist (e.g. Docker), .ts when running with ts-node (local)
const isCompiled = __dirname.includes(path.sep + 'dist' + path.sep);
const migrationsExt = isCompiled ? 'js' : 'ts';
const migrationsPath = path.join(__dirname, '..', 'migrations', `*.${migrationsExt}`);

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.isNaN(port) ? 5432 : port,
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_DATABASE ?? 'docflow_schedule',
  entities: [User, Patient, Appointment, MedicalRecord, MedicalRecordFile, Notification],
  migrations: [migrationsPath],
  synchronize: false,
  logging: true,
});
