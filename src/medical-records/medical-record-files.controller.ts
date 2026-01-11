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
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MedicalRecordFilesService } from './medical-record-files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

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

@Controller('api/medical-records/:medicalRecordId/files')
@UseGuards(JwtAuthGuard) // All routes require authentication
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
    @CurrentUser() user: User,
  ) {
    return await this.filesService.uploadFile(medicalRecordId, file, user.id);
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
    @CurrentUser() user: User,
  ) {
    const uploadedFiles = await Promise.all(
      files.map((file) => this.filesService.uploadFile(medicalRecordId, file, user.id)),
    );
    return uploadedFiles;
  }

  @Get()
  async getFiles(
    @Param('medicalRecordId') medicalRecordId: string,
    @CurrentUser() user: User,
  ) {
    return await this.filesService.getFilesByMedicalRecord(medicalRecordId, user.id);
  }

  @Get('file/:fileId')
  async downloadFile(
    @Param('fileId') fileId: string,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    const { buffer, file } = await this.filesService.getFileBuffer(fileId, user.id);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }

  @Delete('file/:fileId')
  async deleteFile(@Param('fileId') fileId: string, @CurrentUser() user: User) {
    await this.filesService.deleteFile(fileId, user.id);
    return { message: 'File deleted successfully' };
  }

  @Patch('file/:fileId/rename')
  async renameFile(
    @Param('fileId') fileId: string,
    @Body('newName') newName: string,
    @CurrentUser() user: User,
  ) {
    return await this.filesService.renameFile(fileId, newName, user.id);
  }
}
