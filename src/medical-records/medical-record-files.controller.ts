import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MedicalRecordFilesService } from './medical-record-files.service';

// File validation
const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed types: PDF, Images, Word, Excel, Text',
      ),
      false,
    );
  }
};

@Controller('medical-records/:medicalRecordId/files')
export class MedicalRecordFilesController {
  constructor(
    private readonly filesService: MedicalRecordFilesService,
  ) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    }),
  )
  async uploadFile(
    @Param('medicalRecordId') medicalRecordId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.filesService.uploadFile(medicalRecordId, file);
  }

  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      // Max 5 files at once
      fileFilter,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
    }),
  )
  async uploadMultipleFiles(
    @Param('medicalRecordId') medicalRecordId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const uploadedFiles = await Promise.all(
      files.map((file) => this.filesService.uploadFile(medicalRecordId, file)),
    );
    return uploadedFiles;
  }

  @Get()
  async getFiles(@Param('medicalRecordId') medicalRecordId: string) {
    return await this.filesService.getFilesByMedicalRecord(medicalRecordId);
  }

  @Get('file/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const { buffer, file } = await this.filesService.getFileBuffer(fileId);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    await this.filesService.deleteFile(fileId);
    return { message: 'File deleted successfully' };
  }

  @Patch('file/:fileId/rename')
  async renameFile(
    @Param('fileId') fileId: string,
    @Body('newName') newName: string,
  ) {
    return await this.filesService.renameFile(fileId, newName);
  }
}
