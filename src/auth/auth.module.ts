import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from './entities/user.profile.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, UserProfile])],
  controllers: [AuthController],
  providers: [AuthService, JwtService,],
})
export class AuthModule { }
