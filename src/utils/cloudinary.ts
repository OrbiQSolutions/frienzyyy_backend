// import { v2 as cloudinary } from 'cloudinary';
// import { ConfigService } from '@nestjs/config';

// cloudinary.config({
//   cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
//   api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
//   api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
// });

// export const handleUpload = async (file: string) => {
//   console.log("Cloudinary config at upload:", cloudinary.config());
//   const res = await cloudinary.uploader.upload(file, { resource_type: 'auto' });
//   return res;
// }