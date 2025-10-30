import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin.users.service';
import { AdminUsersController } from './admin.users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule { }
