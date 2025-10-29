import { Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address)
    private readonly addressModel: typeof Address
  ) { }

  async create(createAddressDto: CreateAddressDto, req: Request) {
    const { userId } = req['user'];
    const newAddress = await this.addressModel.create({
      userId,
      ...createAddressDto
    });
    return newAddress;
  }

  findAll() {
    return `This action returns all address`;
  }

  findOne(id: number) {
    return `This action returns a #${id} address`;
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    return `This action updates a #${id} address`;
  }

  remove(id: number) {
    return `This action removes a #${id} address`;
  }
}
