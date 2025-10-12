import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './auth/entities/user.entity';
import { UserProfile } from './auth/entities/user.profile.entity';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { AdminUsersModule } from './admin-users/admin.users.module';
import { UserModule } from './user/user.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ChatModule } from './chat/chat.module';
import { ProfileModule } from './profile/profile.module';
import { Address } from './address/entities/address.entity';
import { ProfilePicture } from './user/entities/profile.picture.entity';
import { AddressModule } from './address/address.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    AuthModule,
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
        // host: process.env.REDIS_HOST,
        // port: Number(process.env.REDIS_PORT),
      },
      defaultJobOptions: {
        attempts: 3,
      }
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      // host: process.env.DB_HOST,
      // port: Number(process.env.DB_PORT),
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB_DATABASE,
      models: [User, UserProfile, Address, ProfilePicture],
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      uri: process.env.DB_URL,
    }),
    AdminUsersModule,
    UserModule,
    CloudinaryModule,
    ChatModule,
    ProfileModule,
    AddressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
