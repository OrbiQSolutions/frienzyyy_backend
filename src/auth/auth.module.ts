import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UserProfile } from './entities/user.profile.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserProfile]),
    BullModule.registerQueue(
      { name: process.env.REDIS_EMAIL_QUEUE }
    ),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
