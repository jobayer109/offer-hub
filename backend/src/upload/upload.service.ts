import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'offer-hub',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          },
        )
        .end(file.buffer);
    });
  }

  private validateFile(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, WebP, GIF',
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 1MB');
    }
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.validateFile(file);
    const url = await this.uploadToCloudinary(file);

    return {
      message: 'Image uploaded successfully',
      url,
      path: url,
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
      this.validateFile(file);
      const url = await this.uploadToCloudinary(file);
      urls.push(url);
    }

    return {
      message: `${urls.length} image(s) uploaded successfully`,
      urls,
    };
  }
}
