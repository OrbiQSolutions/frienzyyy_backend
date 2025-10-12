import { HttpStatus, Injectable, Req } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfilePictureDto } from './dto/profile.picture.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import responseBody from 'src/core/commonfunctions/response.body';
import { InjectModel } from '@nestjs/sequelize';
import { ProfilePicture } from './entities/profile.picture.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,

    @InjectModel(ProfilePicture)
    private readonly profilePictureModel: typeof ProfilePicture,
  ) { }

  async addProfilePicture(profilePicture: ProfilePictureDto, image: Express.Multer.File, @Req() request: Request) {
    const { userId } = request['user'];
    const b64 = Buffer.from(image.buffer).toString('base64');
    const dataUri = 'data:' + image.mimetype + ';base64,' + b64;

    console.log("DATA URI LENGTH:", dataUri.length);
    const { secure_url, width, height, format, bytes } = await this.cloudinaryService.uploadImage(dataUri);
    const profilePictureUploaded = await this.profilePictureModel.create({
      userId,
      profileImage: secure_url,
      profileHeight: height,
      profileWidth: width,
      profileFormat: format,
      profileSize: bytes
    });

    return responseBody(HttpStatus.CREATED, 'image updaloaded succefully', profilePictureUploaded);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
