import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ProfilePictureDto } from './dto/profile.picture.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { responseBody } from 'src/core/commonfunctions/response.body';
import { InjectModel } from '@nestjs/sequelize';
import { ProfilePicture } from './entities/profile.picture.entity';
import { message } from 'src/core/constants/message.constants';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,

    @InjectModel(ProfilePicture)
    private readonly profilePictureModel: typeof ProfilePicture,
  ) { }

  async uploadProfilePicture(profilePictureDto: ProfilePictureDto, file: Express.Multer.File, userId: string) {
    try {
      this.logger.log(`Uploading profile picture for user: ${userId}`);
      if (!file) {
        return responseBody(HttpStatus.BAD_REQUEST, 'File is required');
      }
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataUri = 'data:' + file.mimetype + ';base64,' + b64;
      const { secure_url, width, height, format, bytes } = await this.cloudinaryService.uploadImage(dataUri);
      const newPicture = await this.profilePictureModel.create({
        userId,
        profileImage: secure_url,
        profileHeight: height,
        profileWidth: width,
        profileFormat: format,
        profileSize: bytes,
      });
      return responseBody(HttpStatus.CREATED, 'Image uploaded successfully', newPicture);
    } catch (err) {
      this.logger.error(`Profile picture upload failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, message.INTERNAL_SERVER_ERROR);
    }
  }
}
