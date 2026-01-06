import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enum types for PostgreSQL
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "appointment_type_enum" AS ENUM ('checkup', 'cleaning', 'procedure', 'consultation', 'emergency', 'follow-up');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "appointment_status_enum" AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "notification_type_enum" AS ENUM ('appointment', 'reminder', 'alert', 'info');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create patients table
    await queryRunner.createTable(
      new Table({
        name: 'patients',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'dateOfBirth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create appointments table
    await queryRunner.createTable(
      new Table({
        name: 'appointments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patientId',
            type: 'uuid',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'time',
            type: 'time',
          },
          {
            name: 'duration',
            type: 'int',
            default: 30,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            default: "'checkup'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'scheduled'",
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create medical_records table
    await queryRunner.createTable(
      new Table({
        name: 'medical_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'patientId',
            type: 'uuid',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'diagnosis',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'treatment',
            type: 'text',
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'attachments',
            type: 'jsonb',
            isNullable: true,
            default: "'[]'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create notifications table
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'message',
            type: 'text',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            default: "'info'",
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Alter enum columns to use enum types
    // First drop defaults, then alter type, then restore defaults
    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN "type" DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN "type" TYPE "appointment_type_enum" USING "type"::"appointment_type_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN "type" SET DEFAULT 'checkup'::"appointment_type_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN "status" DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN "status" TYPE "appointment_status_enum" USING "status"::"appointment_status_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE appointments 
      ALTER COLUMN "status" SET DEFAULT 'scheduled'::"appointment_status_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ALTER COLUMN "type" DROP DEFAULT;
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ALTER COLUMN "type" TYPE "notification_type_enum" USING "type"::"notification_type_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE notifications 
      ALTER COLUMN "type" SET DEFAULT 'info'::"notification_type_enum";
    `);

    // Create foreign keys
    await queryRunner.createForeignKey(
      'appointments',
      new TableForeignKey({
        columnNames: ['patientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patients',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'medical_records',
      new TableForeignKey({
        columnNames: ['patientId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'patients',
        onDelete: 'CASCADE',
      }),
    );

    // Create trigger function for updatedAt timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create triggers for updatedAt
    await queryRunner.query(`
      CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;`,
    );
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

    // Drop foreign keys first
    const appointmentsTable = await queryRunner.getTable('appointments');
    if (appointmentsTable) {
      const appointmentsForeignKey = appointmentsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('patientId') !== -1,
      );
      if (appointmentsForeignKey) {
        await queryRunner.dropForeignKey('appointments', appointmentsForeignKey);
      }
    }

    const medicalRecordsTable = await queryRunner.getTable('medical_records');
    if (medicalRecordsTable) {
      const medicalRecordsForeignKey = medicalRecordsTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('patientId') !== -1,
      );
      if (medicalRecordsForeignKey) {
        await queryRunner.dropForeignKey('medical_records', medicalRecordsForeignKey);
      }
    }

    // Drop tables
    await queryRunner.dropTable('notifications');
    await queryRunner.dropTable('medical_records');
    await queryRunner.dropTable('appointments');
    await queryRunner.dropTable('patients');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "appointment_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "appointment_type_enum";`);
  }
}
