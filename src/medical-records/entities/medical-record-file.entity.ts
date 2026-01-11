import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

@Entity('medical_record_files')
export class MedicalRecordFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  medicalRecordId: string;

  @Column({ type: 'varchar', length: 255 })
  originalName: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  // Store file content as base64 in database
  @Column({ type: 'text' })
  fileData: string;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relations
  @ManyToOne(() => MedicalRecord, (medicalRecord) => medicalRecord.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;
}
