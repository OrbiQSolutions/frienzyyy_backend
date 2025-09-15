import { Module } from '@nestjs/common';
import { AdminUsersService } from './admin.users.service';
import { AdminUsersController } from './admin.users.controller';
import { User } from 'src/auth/entities/user.entity';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule { }
