import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ProfilePicture } from './entities/profile.picture.entity';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';

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
