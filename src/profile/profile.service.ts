import {
  Injectable,
  Logger,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/auth/entities/user.entity';
import responseBody from 'src/core/commonfunctions/response.body';
import { UserProfile } from 'src/auth/entities/user.profile.entity';
import { Address } from 'src/address/entities/address.entity';
import { SwipeDto } from './dto/swipe.dto';
import { MatchProfile } from './entities/match.profile.entity';
import { Interests } from './entities/interests.entity';
import { AddInterestsDto } from './dto/add.interests.dto';
import { UserInterests } from 'src/auth/entities/user.interests.entity';
import { AuthGuard } from 'src/auth/auth.guard';

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
    private readonly userInterestModel: typeof UserInterests
  ) { }

  async getMatchedProfiles(request: Request) {
    const { userId } = request['user'];
    const userProfile = await this.userProfileModel.findOne({
      where: {
        userId
      }
    });
    let requiredGender = "other";

    if (userProfile && userProfile.gender == 'male') {
      requiredGender = 'female'
    } else if (userProfile && userProfile.gender == 'female') {
      requiredGender = 'male';
    }

    const matchedProfiles = await this.userModel.findAll({
      attributes: {
        exclude: ['otp']
      },
      include: [
        {
          model: UserProfile, as: 'profile', required: true, where: {
            gender: requiredGender
          }
        },
        { model: Address, as: 'address', required: false }
      ]
    });
    return responseBody(201, "The profiles are fetched", matchedProfiles);
  }

  async swipe(swipeDto: SwipeDto, request: Request) {
    console.log(swipeDto);
    const { userId } = request['user'];
    const { profileUserId, status } = swipeDto;
    try {
      await this.matchProfileModel.create({
        userAId: userId,
        userBId: profileUserId,
        status
      });

      if (status == 0) {
        return responseBody(201, "Left swiped");
      }

      const userASwiped = await this.matchProfileModel.findOne({
        where: {
          userAId: profileUserId,
          userBId: userId
        }
      });

      if (!userASwiped) {
        return responseBody(201, "Right swiped");
      }



      return responseBody(201, "It's a match");
    } catch (err) {

    }
  }

  async getAllInterests() {
    return await this.interestsModel.findAll();
  }

  async addInterests(addInterestsDto: AddInterestsDto, userId: string) {
    const { interestsList } = addInterestsDto;
    this.logger.log(interestsList);
    if (!interestsList) return responseBody(201, "The list is empty");
    for (let i = 0; i < interestsList.length; ++i) {
      const interestId = interestsList[i];
      await this.userInterestModel.create({ userId, interestId })
    }

    return responseBody(201, "All the interests are added");
  }

  @UseGuards(AuthGuard)
  async findUser(id: string) {
    const user = await this.userModel.findOne({
      where: { userId: id },
      attributes: {
        exclude: ['password', 'otp']
      },
      include: [
        { model: UserProfile, as: 'profile', required: false },
        { model: Address, as: 'address', required: false },
        { model: Interests, as: 'interests', required: false, attributes: { exclude: ['UserInterests', 'updatedAt', 'createdAt'] } }
      ]
    });

    if (!user) throw new NotFoundException;

    return responseBody(200, "The user successfully found", user);
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
