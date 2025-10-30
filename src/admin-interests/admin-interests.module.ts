import { Module } from '@nestjs/common';
import { AdminInterestsService } from './admin-interests.service';
import { AdminInterestsController } from './admin-interests.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Interests } from '../profile/entities/interests.entity';

@Module({
  imports: [SequelizeModule.forFeature([
    Interests
  ])],
  controllers: [AdminInterestsController],
  providers: [AdminInterestsService],
})
export class AdminInterestsModule { }
