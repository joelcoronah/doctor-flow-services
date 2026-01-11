import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordFile } from './entities/medical-record-file.entity';
import { MedicalRecordsService } from './medical-records.service';

@Injectable()
export class MedicalRecordFilesService {
  constructor(
    @InjectRepository(MedicalRecordFile)
    private readonly fileRepository: Repository<MedicalRecordFile>,
    private readonly medicalRecordsService: MedicalRecordsService,
  ) {}

  /**
   * Upload file for a medical record (store as base64)
   * Multi-tenant: Verifies medical record belongs to doctor
   */
  async uploadFile(
    medicalRecordId: string,
    file: Express.Multer.File,
    doctorId: string,
  ): Promise<MedicalRecordFile> {
    // Verify medical record exists and belongs to this doctor
    await this.medicalRecordsService.findOne(medicalRecordId, doctorId);

    // Convert file buffer to base64
    const base64Data = file.buffer.toString('base64');

    const fileEntity = this.fileRepository.create({
      medicalRecordId,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileData: base64Data,
    });

    return await this.fileRepository.save(fileEntity);
  }

  /**
   * Get all files for a medical record
   * Multi-tenant: Verifies medical record belongs to doctor
   */
  async getFilesByMedicalRecord(
    medicalRecordId: string,
    doctorId: string,
  ): Promise<MedicalRecordFile[]> {
    // Verify medical record exists and belongs to this doctor
    await this.medicalRecordsService.findOne(medicalRecordId, doctorId);

    return await this.fileRepository.find({
      where: { medicalRecordId },
      order: { uploadedAt: 'DESC' },
      // Don't select fileData by default to reduce payload size
      select: [
        'id',
        'medicalRecordId',
        'originalName',
        'mimeType',
        'fileSize',
        'uploadedAt',
      ],
    });
  }

  /**
   * Get a single file with data
   * Multi-tenant: Verifies file belongs to doctor's medical record
   */
  async getFile(id: string, doctorId: string): Promise<MedicalRecordFile> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['medicalRecord'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Verify the medical record belongs to this doctor
    await this.medicalRecordsService.findOne(file.medicalRecordId, doctorId);

    return file;
  }

  /**
   * Delete a file
   * Multi-tenant: Verifies file belongs to doctor's medical record
   */
  async deleteFile(id: string, doctorId: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Verify the medical record belongs to this doctor
    await this.medicalRecordsService.findOne(file.medicalRecordId, doctorId);

    await this.fileRepository.remove(file);
  }

  /**
   * Get file buffer for download
   * Multi-tenant: Verifies file belongs to doctor's medical record
   */
  async getFileBuffer(id: string, doctorId: string): Promise<{
    buffer: Buffer;
    file: MedicalRecordFile;
  }> {
    const file = await this.getFile(id, doctorId);

    // Convert base64 back to buffer
    const buffer = Buffer.from(file.fileData, 'base64');

    return { buffer, file };
  }

  /**
   * Rename a file
   * Multi-tenant: Verifies file belongs to doctor's medical record
   */
  async renameFile(id: string, newName: string, doctorId: string): Promise<MedicalRecordFile> {
    const file = await this.fileRepository.findOne({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Verify the medical record belongs to this doctor
    await this.medicalRecordsService.findOne(file.medicalRecordId, doctorId);

    file.originalName = newName;
    return await this.fileRepository.save(file);
  }
}
