import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user.profile.entity';
import { BullModule } from '@nestjs/bullmq';
import { EmailWorker } from 'src/redis_worker/email.worker';

@Module({
  imports: [
    SequelizeModule.forFeature([User, UserProfile]),
    BullModule.registerQueue(
      {
        name: "emails",
        defaultJobOptions: {
          removeOnComplete: true,
          attempts: 1
        }
      },
    ),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailWorker],
})
export class AuthModule { }
