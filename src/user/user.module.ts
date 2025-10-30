import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ProfilePicture } from './entities/profile.picture.entity';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ProfilePicture
    ]),
    CloudinaryModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
  ],
})
export class UserModule { }
