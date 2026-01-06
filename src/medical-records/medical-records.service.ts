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

    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      patientId,
      date: new Date(createMedicalRecordDto.date),
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
      relations: ['patient'],
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
      updateMedicalRecordDto.date = new Date(updateMedicalRecordDto.date).toISOString();
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
