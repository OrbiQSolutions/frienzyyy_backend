import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { MatchProfile } from './entities/match.profile.entity';
import { Interests } from './entities/interests.entity';
import { User } from '../auth/entities/user.entity';
import { UserInterests } from '../auth/entities/user.interests.entity';
import { UserProfile } from '../auth/entities/user.profile.entity';
import { ChatList } from '../chat/entities/chat.list.entity';
import { ProfilePicture } from '../user/entities/profile.picture.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      UserProfile,
      ProfilePicture,
      MatchProfile,
      Interests,
      UserInterests,
      ChatList
    ])
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule { }
