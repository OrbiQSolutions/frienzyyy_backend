import { Injectable } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(private readonly cloudinaryProvider: CloudinaryProvider) {}

  async uploadImage(filePath: string) {
    const cloudinary = this.cloudinaryProvider.getCloudinary();
    return await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
    });
  }
}
