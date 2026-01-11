import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedPatients } from './patients.seeder';
import { seedAppointments } from './appointments.seeder';
import { seedMedicalRecords } from './medical-records.seeder';
import { seedNotifications } from './notifications.seeder';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { MedicalRecordFile } from '../medical-records/entities/medical-record-file.entity';
import { Notification } from '../notifications/entities/notification.entity';

config();

async function runSeeders() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'docflow_schedule',
    entities: [Patient, Appointment, MedicalRecord, MedicalRecordFile, Notification],
    synchronize: false,
    logging: false,
  });

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected successfully\n');

    console.log('🌱 Starting seeders...\n');

    // Seed in order: patients first (they are referenced by other entities)
    console.log('📋 Seeding patients...');
    await seedPatients(dataSource);
    console.log('');

    // Then appointments and medical records (they depend on patients)
    console.log('📅 Seeding appointments...');
    await seedAppointments(dataSource);
    console.log('');

    console.log('🏥 Seeding medical records...');
    await seedMedicalRecords(dataSource);
    console.log('');

    // Notifications are independent
    console.log('🔔 Seeding notifications...');
    await seedNotifications(dataSource);
    console.log('');

    console.log('✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };
