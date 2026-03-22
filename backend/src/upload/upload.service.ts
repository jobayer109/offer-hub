import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 2MB
const UPLOAD_DIR = path.join(__dirname, '../../uploads/offers');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 1MB');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const publicUrl = `/uploads/offers/${fileName}`;

    return {
      message: 'Image uploaded successfully',
      url: publicUrl,
      path: publicUrl,
    };
  }

  async uploadMultipleImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 images allowed');
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type for "${file.originalname}". Allowed: JPEG, PNG, WebP, GIF`,
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File "${file.originalname}" is too large. Maximum size is 1MB`,
        );
      }

      const fileExt = file.originalname.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      fs.writeFileSync(filePath, file.buffer);

      urls.push(`/uploads/offers/${fileName}`);
    }

    return {
      message: `${urls.length} image(s) uploaded successfully`,
      urls,
    };
  }
}
