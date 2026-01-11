import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecordFile } from './entities/medical-record-file.entity';

@Injectable()
export class MedicalRecordFilesService {
  constructor(
    @InjectRepository(MedicalRecordFile)
    private readonly fileRepository: Repository<MedicalRecordFile>,
  ) {}

  /**
   * Upload file for a medical record (store as base64)
   */
  async uploadFile(
    medicalRecordId: string,
    file: Express.Multer.File,
  ): Promise<MedicalRecordFile> {
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
   */
  async getFilesByMedicalRecord(
    medicalRecordId: string,
  ): Promise<MedicalRecordFile[]> {
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
   */
  async getFile(id: string): Promise<MedicalRecordFile> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<void> {
    const file = await this.fileRepository.findOne({
      where: { id },
      select: ['id'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.fileRepository.remove(file);
  }

  /**
   * Get file buffer for download
   */
  async getFileBuffer(id: string): Promise<{
    buffer: Buffer;
    file: MedicalRecordFile;
  }> {
    const file = await this.getFile(id);

    // Convert base64 back to buffer
    const buffer = Buffer.from(file.fileData, 'base64');

    return { buffer, file };
  }

  /**
   * Rename a file
   */
  async renameFile(id: string, newName: string): Promise<MedicalRecordFile> {
    const file = await this.fileRepository.findOne({
      where: { id },
      select: ['id', 'originalName'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    file.originalName = newName;
    return await this.fileRepository.save(file);
  }
}
