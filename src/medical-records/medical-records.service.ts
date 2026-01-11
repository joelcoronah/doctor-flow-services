import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    private readonly patientsService: PatientsService,
  ) {}

  /**
   * Create a new medical record for a patient (multi-tenant - filtered by doctorId)
   */
  async create(
    patientId: string,
    createMedicalRecordDto: CreateMedicalRecordDto,
    doctorId: string,
  ): Promise<MedicalRecord> {
    // Verify patient exists and belongs to this doctor
    await this.patientsService.findOne(patientId, doctorId);

    // Parse date string as local date without timezone conversion
    const [year, month, day] = createMedicalRecordDto.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      patientId,
      doctorId, // Set the current doctor's ID
      date: localDate,
      attachments: createMedicalRecordDto.attachments || [],
    });

    return await this.medicalRecordRepository.save(medicalRecord);
  }

  /**
   * Find all medical records for a patient (multi-tenant - filtered by doctorId)
   */
  async findByPatient(patientId: string, doctorId: string): Promise<{ data: MedicalRecord[] }> {
    // Verify patient exists and belongs to this doctor
    await this.patientsService.findOne(patientId, doctorId);

    const records = await this.medicalRecordRepository.find({
      where: { patientId, doctorId }, // Filter by doctor
      relations: ['files'],
      order: { date: 'DESC' },
    });

    return { data: records };
  }

  /**
   * Find a medical record by ID (multi-tenant - filtered by doctorId)
   */
  async findOne(id: string, doctorId: string): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordRepository.findOne({
      where: { id, doctorId }, // Ensure record belongs to this doctor
      relations: ['patient', 'files'],
    });

    if (!medicalRecord) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    return medicalRecord;
  }

  /**
   * Update a medical record (multi-tenant - filtered by doctorId)
   */
  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto, doctorId: string): Promise<MedicalRecord> {
    const medicalRecord = await this.findOne(id, doctorId); // Verify ownership

    if (updateMedicalRecordDto.date) {
      // Parse date string as local date without timezone conversion
      const [year, month, day] = updateMedicalRecordDto.date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      updateMedicalRecordDto.date = localDate.toISOString();
    }

    Object.assign(medicalRecord, updateMedicalRecordDto);
    return await this.medicalRecordRepository.save(medicalRecord);
  }

  /**
   * Delete a medical record (multi-tenant - filtered by doctorId)
   */
  async remove(id: string, doctorId: string): Promise<void> {
    const medicalRecord = await this.findOne(id, doctorId); // Verify ownership
    await this.medicalRecordRepository.remove(medicalRecord);
  }
}
