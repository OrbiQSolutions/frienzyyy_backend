import {
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/sequelize';
import { SwipeDto } from './dto/swipe.dto';
import { MatchProfile } from './entities/match.profile.entity';
import { Interests } from './entities/interests.entity';
import { AddInterestsDto } from './dto/add.interests.dto';
import { Op } from 'sequelize';
import { InterestDto } from './dto/interest.dto';
import { User } from '../auth/entities/user.entity';
import { UserProfile } from '../auth/entities/user.profile.entity';
import { UserInterests } from '../auth/entities/user.interests.entity';
import { ChatList } from '../chat/entities/chat.list.entity';
import { Address } from '../address/entities/address.entity';
import { responseBody } from '../core/commonfunctions/response.body';
import { message } from '../core/constants/message.constants';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(Interests)
    private readonly interestsModel: typeof Interests,

    @InjectModel(UserProfile)
    private readonly userProfileModel: typeof UserProfile,

    @InjectModel(MatchProfile)
    private readonly matchProfileModel: typeof MatchProfile,

    @InjectModel(UserInterests)
    private readonly userInterestModel: typeof UserInterests,

    @InjectModel(ChatList)
    private readonly chatList: typeof ChatList
  ) { }

  async getMatchedProfiles(userId: string) {
    try {
      this.logger.log(`Fetching matched profiles for user: ${userId}`);
      const userProfile = await this.userProfileModel.findOne({
        where: { userId }
      });
      let requiredGender = 'other';

      if (userProfile?.gender === 'male') {
        requiredGender = 'female';
      } else if (userProfile?.gender === 'female') {
        requiredGender = 'male';
      }

      const matchedProfiles = await this.userModel.findAll({
        where: { userId: { [Op.ne]: userId } },
        attributes: { exclude: ['password', 'otp'] },
        include: [
          {
            model: UserProfile,
            as: 'profile',
            required: true,
            where: { gender: requiredGender }
          },
          { model: Address, as: 'address', required: false }
        ]
      });
      this.logger.log(`Found ${matchedProfiles.length} matched profiles`);
      return responseBody(HttpStatus.OK, 'Profiles fetched successfully', matchedProfiles);
    } catch (err) {
      this.logger.error(`Matched profiles fetch failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async swipe(swipeDto: SwipeDto, userId: string) {
    try {
      this.logger.log(`Swipe action for user ${userId}: ${JSON.stringify(swipeDto)}`);
      const { profileUserId, status } = swipeDto;
      if (profileUserId === userId) {
        return responseBody(HttpStatus.BAD_REQUEST, 'Cannot swipe self');
      }

      await this.matchProfileModel.create({
        userAId: userId,
        userBId: profileUserId,
        status
      });

      if (status === 0) { // Left swipe
        return responseBody(HttpStatus.CREATED, 'Left swiped', { isMatched: false });
      }

      // Check mutual swipe
      const mutualSwipe = await this.matchProfileModel.findOne({
        where: {
          userAId: profileUserId,
          userBId: userId,
          status: 1 // Right swipe
        }
      });

      if (mutualSwipe) {
        const chatList = await this.chatList.create({
          userId,
          chatUserId: profileUserId
        });
        this.logger.log(`Match found between ${userId} and ${profileUserId}`);
        return responseBody(HttpStatus.CREATED, 'It\'s a match!', { isMatched: true, chatId: chatList.id });
      }

      return responseBody(HttpStatus.CREATED, 'Right swiped', { isMatched: false });
    } catch (err) {
      this.logger.error(`Swipe failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllInterests() {
    try {
      this.logger.log('Fetching all interests');
      const allInterests = await this.interestsModel.findAll({
        order: [['interestName', 'ASC']]
      });
      return responseBody(HttpStatus.OK, 'All interests fetched', allInterests);
    } catch (err) {
      this.logger.error(`Interests fetch failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async addInterests(addInterestsDto: AddInterestsDto, userId: string) {
    try {
      this.logger.log(`Adding interests for user ${userId}: ${JSON.stringify(addInterestsDto)}`);
      const { interestsList } = addInterestsDto;
      if (!interestsList || interestsList.length === 0) {
        return responseBody(HttpStatus.BAD_REQUEST, 'Interests list is empty');
      }

      // Check existing interests to avoid duplicates
      const existingInterests = await this.userInterestModel.findAll({ where: { userId } });
      const existingIds = existingInterests.map(i => i.interestId);

      // Extract interestId from InterestDto objects
      const toAdd = interestsList
        .map((item: InterestDto) => item.interestId) // Assume InterestDto has interestId
        .filter((id: string) => !existingIds.includes(id));

      if (toAdd.length === 0) {
        return responseBody(HttpStatus.OK, 'No new interests to add');
      }

      const createdInterests: string[] = [];
      for (const interestId of toAdd) {
        await this.userInterestModel.create({ userId, interestId });
        createdInterests.push(interestId);
      }

      this.logger.log(`Added ${createdInterests.length} interests for user ${userId}`);
      return responseBody(HttpStatus.CREATED, 'Interests added successfully', createdInterests);
    } catch (err) {
      this.logger.error(`Interests add failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, message.INTERNAL_SERVER_ERROR);
    }
  }

  async findUser(userId: string) {
    try {
      this.logger.log(`Fetching user: ${userId}`);
      const user = await this.userModel.findOne({
        where: { userId },
        attributes: { exclude: ['password', 'otp', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: UserProfile, as: 'profile', required: false },
          { model: Address, as: 'address', required: false },
          {
            model: Interests,
            as: 'interests',
            required: false,
            attributes: { exclude: ['UserInterests', 'updatedAt', 'createdAt'] },
            through: { attributes: [] }
          }
        ]
      });

      if (!user) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }

      return responseBody(HttpStatus.OK, 'User found successfully', user);
    } catch (err) {
      this.logger.error(`User fetch failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllSwipedProfiles(userId: string) {
    try {
      this.logger.log(`Fetching swiped profiles for user: ${userId}`);
      const allSwipedProfiles = await this.matchProfileModel.findAll({
        where: { userAId: userId },
        include: [{
          model: User,
          as: 'userB',
          required: false,
          attributes: { exclude: ['otp', 'resetPasswordToken', 'resetPasswordExpires', 'password'] }
        }]
      });

      return responseBody(HttpStatus.OK, 'Swiped profiles fetched successfully', allSwipedProfiles);
    } catch (err) {
      this.logger.error(`Swiped profiles fetch failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateProfileDto: UpdateProfileDto) {
    try {
      this.logger.log(`Updating profile for ID: ${id}`);
      const user = await this.userModel.findByPk(id);
      if (!user) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }
      await user.update(updateProfileDto);
      const { password, otp, ...updatedUser } = user.get({ plain: true });
      return responseBody(HttpStatus.OK, message.PROFILE_UPDATED, updatedUser);
    } catch (err) {
      this.logger.error(`Profile update failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, message.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Deleting profile for ID: ${id}`);
      const user = await this.userModel.findByPk(id);
      if (!user) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }
      await user.destroy();
      return responseBody(HttpStatus.OK, message.DELETED_SUCCESS);
    } catch (err) {
      this.logger.error(`Profile delete failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }
}
