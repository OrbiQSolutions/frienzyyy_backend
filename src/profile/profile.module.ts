import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { User } from 'src/auth/entities/user.entity';
import { ProfilePicture } from 'src/user/entities/profile.picture.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, ProfilePicture])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule { }
