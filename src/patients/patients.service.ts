import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Create a new patient
   */
  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    let dateOfBirth = null;
    if (createPatientDto.dateOfBirth) {
      // Parse date string as local date without timezone conversion
      const [year, month, day] = createPatientDto.dateOfBirth.split('-').map(Number);
      dateOfBirth = new Date(year, month - 1, day);
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      dateOfBirth,
    });
    return await this.patientRepository.save(patient);
  }

  /**
   * Find all patients with pagination and search
   */
  async findAll(queryDto: QueryPatientDto) {
    const { search, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.patientRepository.createQueryBuilder('patient');

    if (search) {
      queryBuilder.where(
        '(patient.name ILIKE :search OR patient.email ILIKE :search OR patient.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('patient.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a patient by ID
   */
  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['appointments', 'medicalRecords', 'medicalRecords.files'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  /**
   * Update a patient
   */
  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    if (updatePatientDto.dateOfBirth) {
      // Parse date string as local date without timezone conversion
      const [year, month, day] = updatePatientDto.dateOfBirth.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      updatePatientDto.dateOfBirth = localDate.toISOString();
    }

    Object.assign(patient, updatePatientDto);
    return await this.patientRepository.save(patient);
  }

  /**
   * Delete a patient
   */
  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }
}
