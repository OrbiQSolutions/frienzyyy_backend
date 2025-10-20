import {
  Injectable,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/auth/entities/user.entity';
import responseBody from 'src/core/commonfunctions/response.body';
import { UserProfile } from 'src/auth/entities/user.profile.entity';
import { Address } from 'src/address/entities/address.entity';
import { SwipeDto } from './dto/swipe.dto';
import { MatchProfile } from './entities/match.profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(MatchProfile)
    private readonly matchProfileModel: typeof MatchProfile,
  ) { }

  async getMatchedProfiles() {
    const matchedProfiles = await this.userModel.findAll({
      attributes: {
        exclude: ['otp']
      },
      include: [
        { model: UserProfile, as: 'profile', required: false },
        { model: Address, as: 'address', required: false }
      ]
    });
    return responseBody(201, "The profiles are fetched", matchedProfiles);
  }

  async swipe(swipeDto: SwipeDto, request: Request) {
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

  findAll() {
    return `This action returns all profile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
