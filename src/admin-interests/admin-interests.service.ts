import { Injectable } from '@nestjs/common';
import { CreateAdminInterestDto } from './dto/create-admin-interest.dto';
import { UpdateAdminInterestDto } from './dto/update-admin-interest.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Interests } from 'src/profile/entities/interests.entity';
import responseBody from 'src/core/commonfunctions/response.body';

@Injectable()
export class AdminInterestsService {
  constructor(
    @InjectModel(Interests)
    private readonly interestsModel: typeof Interests
  ) { }

  async create(createAdminInterestDto: CreateAdminInterestDto) {
    const { interestName, imageUrl } = createAdminInterestDto;
    const interest = await this.interestsModel.create({ interestName, imageUrl });

    return responseBody(201, "Interests created successfully", interest);
  }

  findAll() {
    return `This action returns all adminInterests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminInterest`;
  }

  update(id: number, updateAdminInterestDto: UpdateAdminInterestDto) {
    return `This action updates a #${id} adminInterest`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminInterest`;
  }
}
