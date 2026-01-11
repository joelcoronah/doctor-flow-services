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
   * Create a new medical record for a patient
   */
  async create(
    patientId: string,
    createMedicalRecordDto: CreateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    // Verify patient exists
    await this.patientsService.findOne(patientId);

    // Parse date string as local date without timezone conversion
    const [year, month, day] = createMedicalRecordDto.date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      patientId,
      date: localDate,
      attachments: createMedicalRecordDto.attachments || [],
    });

    return await this.medicalRecordRepository.save(medicalRecord);
  }

  /**
   * Find all medical records for a patient
   */
  async findByPatient(patientId: string): Promise<{ data: MedicalRecord[] }> {
    // Verify patient exists
    await this.patientsService.findOne(patientId);

    const records = await this.medicalRecordRepository.find({
      where: { patientId },
      relations: ['files'],
      order: { date: 'DESC' },
    });

    return { data: records };
  }

  /**
   * Find a medical record by ID
   */
  async findOne(id: string): Promise<MedicalRecord> {
    const medicalRecord = await this.medicalRecordRepository.findOne({
      where: { id },
      relations: ['patient', 'files'],
    });

    if (!medicalRecord) {
      throw new NotFoundException(`Medical record with ID ${id} not found`);
    }

    return medicalRecord;
  }

  /**
   * Update a medical record
   */
  async update(id: string, updateMedicalRecordDto: UpdateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = await this.findOne(id);

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
   * Delete a medical record
   */
  async remove(id: string): Promise<void> {
    const medicalRecord = await this.findOne(id);
    await this.medicalRecordRepository.remove(medicalRecord);
  }
}
