import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Address
    ])
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule { }
