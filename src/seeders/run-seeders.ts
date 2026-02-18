import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedUsers } from './users.seeder';
import { seedPatients } from './patients.seeder';
import { seedAppointments } from './appointments.seeder';
import { seedMedicalRecords } from './medical-records.seeder';
import { seedNotifications } from './notifications.seeder';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { MedicalRecordFile } from '../medical-records/entities/medical-record-file.entity';
import { Notification } from '../notifications/entities/notification.entity';

config({ path: '.env', override: false });

async function runSeeders() {
  const port = Number(process.env.DB_PORT) || 5432;

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number.isNaN(port) ? 5432 : port,
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_DATABASE ?? 'docflow_schedule',
    entities: [User, Patient, Appointment, MedicalRecord, MedicalRecordFile, Notification],
    synchronize: false,
    logging: false,
  });

  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected successfully\n');

    console.log('🌱 Starting seeders...\n');

    // Seed users first (they are referenced by all other entities)
    console.log('👥 Seeding users/doctors...');
    const users = await seedUsers(dataSource);
    console.log('');

    // NOTE: Existing seeders will use the default admin user created by migration
    // New patients, appointments, and medical records will be assigned to the default admin
    // You can manually reassign them to different doctors if needed

    // Seed patients (will be assigned to default admin from migration)
    console.log('📋 Seeding patients...');
    await seedPatients(dataSource, users);
    console.log('');

    // Then appointments and medical records
    console.log('📅 Seeding appointments...');
    await seedAppointments(dataSource);
    console.log('');

    console.log('🏥 Seeding medical records...');
    await seedMedicalRecords(dataSource);
    console.log('');

    // Notifications
    console.log('🔔 Seeding notifications...');
    await seedNotifications(dataSource);
    console.log('');

    console.log('✅ All seeders completed successfully!');
    console.log('\n🎯 Multi-Tenant System Ready:');
    console.log('   - Created ' + users.length + ' doctors/users');
    console.log('   - All existing data is assigned to: admin@docflow.com');
    console.log('   - New sample data is being added');
    console.log('   - Login with any user: password123');
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
