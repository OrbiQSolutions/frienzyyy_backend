import { Injectable } from '@nestjs/common';
import { CreateAdminInterestDto } from './dto/create-admin-interest.dto';
import { UpdateAdminInterestDto } from './dto/update-admin-interest.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Interests } from '../profile/entities/interests.entity';
import { responseBody } from '../core/commonfunctions/response.body';

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

  async findAll() {
    return await this.interestsModel.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} adminInterest`;
  }

  async update(id: string, updateAdminInterestDto: UpdateAdminInterestDto) {
    console.log({ ...updateAdminInterestDto });
    const updatedInterest = await this.interestsModel.update({ ...updateAdminInterestDto }, {
      where: {
        interestId: id
      }
    })
    return responseBody(203, "The interest updated successfully", updatedInterest);
  }

  remove(id: number) {
    return `This action removes a #${id} adminInterest`;
  }
}
