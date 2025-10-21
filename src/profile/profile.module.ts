import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { User } from 'src/auth/entities/user.entity';
import { ProfilePicture } from 'src/user/entities/profile.picture.entity';
import { MatchProfile } from './entities/match.profile.entity';
import { UserProfile } from 'src/auth/entities/user.profile.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserProfile,
      ProfilePicture,
      MatchProfile
    ])
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule { }
