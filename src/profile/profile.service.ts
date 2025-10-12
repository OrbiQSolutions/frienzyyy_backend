import {
  Injectable,
} from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/auth/entities/user.entity';
import responseBody from 'src/core/commonfunctions/response.body';
import { UserProfile } from 'src/auth/entities/user.profile.entity';
import { Address } from 'src/address/entities/address.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User
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
