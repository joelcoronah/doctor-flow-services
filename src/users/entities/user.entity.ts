import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Patient } from '../../patients/entities/patient.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

/**
 * User entity - Represents a doctor/user in the system
 * Each user has their own patients, appointments, and medical records
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude() // Don't expose password in API responses
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  specialization: string; // e.g., "General Dentistry", "Orthodontics"

  @Column({ nullable: true })
  licenseNumber: string; // Professional license number

  @Column({ nullable: true })
  profilePhoto: string; // URL or Base64

  // OAuth provider info
  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  facebookId: string;

  // Provider indicates how the user signed up
  @Column({ default: 'email' })
  provider: 'email' | 'google' | 'facebook';

  // Role for future admin functionality
  @Column({ default: 'doctor' })
  role: 'doctor' | 'admin';

  // Account status
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  // Relationships - A doctor has many patients and appointments
  @OneToMany(() => Patient, (patient) => patient.doctor)
  patients: Patient[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
