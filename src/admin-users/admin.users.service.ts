import { Injectable } from '@nestjs/common';
import { CreateAdminUserDto } from './dto/create-admin.user.dto';
import { UpdateAdminUserDto } from './dto/update-admin.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/auth/entities/user.entity';
import responseBody from 'src/core/commonfunctions/response.body';
import { UserProfile } from 'src/auth/entities/user.profile.entity';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) { }

  create(createAdminUserDto: CreateAdminUserDto) {
    return 'This action adds a new adminUser';
  }

  async getAllUsers() {
    try {
      const users = await this.userModel.findAndCountAll({
        attributes: { exclude: ['password'] },
        include: [
          {
            model: UserProfile,
            required: false
          }
        ]
      });

      return responseBody(200, 'Users retrieved successfully', users);
    } catch (error) {
      throw error;
    }
    return `This action returns all adminUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminUser`;
  }

  update(id: number, updateAdminUserDto: UpdateAdminUserDto) {
    return `This action updates a #${id} adminUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminUser`;
  }
}
