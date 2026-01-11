import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMultiTenantArchitecture1768152655893 implements MigrationInterface {
    name = 'AddMultiTenantArchitecture1768152655893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Drop existing foreign key constraints temporarily
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_13c2e57cb81b44f062ba24df57d"`);
        await queryRunner.query(`ALTER TABLE "medical_record_files" DROP CONSTRAINT IF EXISTS "FK_117a8d4b169e492e63ff667eaf1"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_medical_record_files_medicalRecordId"`);
        
        // Step 2: Create users table
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "phone" character varying, "specialization" character varying, "licenseNumber" character varying, "profilePhoto" character varying, "googleId" character varying, "facebookId" character varying, "provider" character varying NOT NULL DEFAULT 'email', "role" character varying NOT NULL DEFAULT 'doctor', "isActive" boolean NOT NULL DEFAULT true, "isEmailVerified" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        
        // Step 3: Create a default admin user for existing data
        // Password: 'password123' (hashed with bcrypt)
        const defaultPassword = '$2b$10$3fMMKxNtoVQHzslFOfugdOlLvaQefZuu9vAHFvLjKc1YIhTuCZJ1C';
        await queryRunner.query(`
            INSERT INTO "users" ("name", "email", "password", "phone", "specialization", "provider", "role", "isActive", "isEmailVerified")
            VALUES ('Default Admin', 'admin@docflow.com', '${defaultPassword}', '+1-555-0000', 'General Practice', 'email', 'admin', true, true)
        `);
        
        // Step 4: Get the default user ID
        const result = await queryRunner.query(`SELECT id FROM "users" WHERE email = 'admin@docflow.com' LIMIT 1`);
        const defaultUserId = result[0].id;
        
        // Step 5: Add doctorId columns as NULLABLE first
        await queryRunner.query(`ALTER TABLE "appointments" ADD "doctorId" uuid`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD "doctorId" uuid`);
        await queryRunner.query(`ALTER TABLE "patients" ADD "doctorId" uuid`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD "doctorId" uuid`);
        
        // Step 6: Set the default user ID for all existing records
        await queryRunner.query(`UPDATE "appointments" SET "doctorId" = '${defaultUserId}' WHERE "doctorId" IS NULL`);
        await queryRunner.query(`UPDATE "medical_records" SET "doctorId" = '${defaultUserId}' WHERE "doctorId" IS NULL`);
        await queryRunner.query(`UPDATE "patients" SET "doctorId" = '${defaultUserId}' WHERE "doctorId" IS NULL`);
        await queryRunner.query(`UPDATE "notifications" SET "doctorId" = '${defaultUserId}' WHERE "doctorId" IS NULL`);
        
        // Step 7: Now make doctorId columns NOT NULL
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "doctorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "doctorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "doctorId" SET NOT NULL`);
        // Keep notifications nullable as they might be system-wide
        
        // Step 8: Update enum types
        await queryRunner.query(`ALTER TYPE "public"."appointment_type_enum" RENAME TO "appointment_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_type_enum" AS ENUM('checkup', 'cleaning', 'procedure', 'consultation', 'emergency', 'follow-up')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "type" TYPE "public"."appointments_type_enum" USING "type"::"text"::"public"."appointments_type_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "type" SET DEFAULT 'checkup'`);
        await queryRunner.query(`DROP TYPE "public"."appointment_type_enum_old"`);
        
        await queryRunner.query(`ALTER TYPE "public"."appointment_status_enum" RENAME TO "appointment_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "public"."appointments_status_enum" USING "status"::"text"::"public"."appointments_status_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'scheduled'`);
        await queryRunner.query(`DROP TYPE "public"."appointment_status_enum_old"`);
        
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum" RENAME TO "notification_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('appointment', 'reminder', 'alert', 'info')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'info'`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum_old"`);
        
        // Step 9: Update default timestamps
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "medical_record_files" ALTER COLUMN "uploadedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        
        // Step 10: Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_0c1af27b469cb8dca420c160d65" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_record_files" ADD CONSTRAINT "FK_117a8d4b169e492e63ff667eaf1" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_c39435c71c0fff03449eb6b2332" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_doctorId" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign keys
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_doctorId"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT IF EXISTS "FK_c39435c71c0fff03449eb6b2332"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "FK_fb2a8c47032fe6f18e9266951df"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT IF EXISTS "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`ALTER TABLE "medical_record_files" DROP CONSTRAINT IF EXISTS "FK_117a8d4b169e492e63ff667eaf1"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_0c1af27b469cb8dca420c160d65"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "FK_13c2e57cb81b44f062ba24df57d"`);
        
        // Revert timestamp defaults
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "patients" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "medical_records" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "medical_record_files" ALTER COLUMN "uploadedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        
        // Revert enum types
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum_old" AS ENUM('appointment', 'reminder', 'alert', 'info')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notification_type_enum_old" USING "type"::"text"::"public"."notification_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'info'`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notification_type_enum_old" RENAME TO "notification_type_enum"`);
        
        await queryRunner.query(`CREATE TYPE "public"."appointment_status_enum_old" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "public"."appointment_status_enum_old" USING "status"::"text"::"public"."appointment_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'scheduled'`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."appointment_status_enum_old" RENAME TO "appointment_status_enum"`);
        
        await queryRunner.query(`CREATE TYPE "public"."appointment_type_enum_old" AS ENUM('checkup', 'cleaning', 'procedure', 'consultation', 'emergency', 'follow-up')`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "type" TYPE "public"."appointment_type_enum_old" USING "type"::"text"::"public"."appointment_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "appointments" ALTER COLUMN "type" SET DEFAULT 'checkup'`);
        await queryRunner.query(`DROP TYPE "public"."appointments_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."appointment_type_enum_old" RENAME TO "appointment_type_enum"`);
        
        // Remove doctorId columns
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "doctorId"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "doctorId"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP COLUMN "doctorId"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "doctorId"`);
        
        // Drop users table
        await queryRunner.query(`DROP TABLE "users"`);
        
        // Recreate old constraints
        await queryRunner.query(`CREATE INDEX "IDX_medical_record_files_medicalRecordId" ON "medical_record_files" ("medicalRecordId") `);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_record_files" ADD CONSTRAINT "FK_117a8d4b169e492e63ff667eaf1" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
}
