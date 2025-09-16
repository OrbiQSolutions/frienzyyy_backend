import {
  BadRequestException,
  Injectable,
  Logger,
  MethodNotAllowedException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import responseBody from 'src/core/commonfunctions/response.body';
import { UserProfile } from './entities/user.profile.entity';
import { message } from 'src/core/constants/message.constants';
import { CreateWithEmailVerify } from './dto/create.with.email.verify';
import { CreateWithEmailName } from './dto/create.with.email.name';
import { CreateWithEmailDob } from './dto/create.with.email.dob';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectModel(User)
    private userModel: typeof User,

    @InjectModel(UserProfile)
    private userProfileModel: typeof UserProfile,

    @InjectQueue("emails")
    private readonly emailQueue: Queue,
  ) { }

  private readonly logger = new Logger(AuthService.name);

  private generateFourDigitRandomNumber(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  async signup(createAuthDto: CreateAuthDto) {
    const { email, password, firstName, lastName } = createAuthDto;

    const existingUser = await this.userModel.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const newUser = await this.userModel.create({
      email,
      password,
      firstName,
      lastName
    });

    const { password: _, ...userWithoutPass } = newUser.get({ plain: true });

    return {
      message: 'User registered successfully',
      data: userWithoutPass
    };
  }

  async signupWithEmail(reqBody: any, response: Response) {
    try {
      const { email } = reqBody;

      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }
      this.logger.log(`No user were found with email: ${email}, proceeding to create a new user.`);

      const otp = this.generateFourDigitRandomNumber();

      const newUser = await this.userModel.create({
        email, otp
      });

      this.logger.log(`User created with email: ${email}. Proceeding to send verification email.`);

      await this.emailQueue.add('signup-email', {
        to: email,
        subject: 'Frienzyyy - Email Verification',
        text: `Your OTP for email verification is ${otp}`,
        html: `<p>Your OTP for email verification is <strong>${otp}</strong></p>`,
      });

      const { password, otp: _, ...userWithoutPass } = newUser.get({ plain: true });

      this.logger.log(`Verification email sent to ${email}.`);

      return {
        message: 'User registered successfully',
        data: userWithoutPass
      };
    } catch (exception) {
      return exception;
    }
  }

  async signupWithEmailPassword(reqBody: any, request: Request) {

    const { email } = request['user'];
    const { password } = reqBody;

    this.logger.log(`Setting password for user with email: ${email} ${password}`);

    try {
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      if (existingUser && existingUser.get({ plain: true }).password !== null) {
        throw new MethodNotAllowedException("The password is set already");
      }

      const user = await this.userModel.update(
        { password },
        {
          where: { email }
        }
      );
      if (user[0] === 1)
        return responseBody(200, "Successfully updated");
      else {

      }
    } catch (err) {

    }
  }

  async signupWithEmailVerify(reqBody: CreateWithEmailVerify, response: Response) {
    const { email, otp } = reqBody;
    try {

      const user = await this.userModel.findOne({ where: { email } });

      if (!user) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      const userOtp: string = user?.get({ plain: true }).otp;
      const userId: string = user?.get({ plain: true }).userId;
      if (otp !== userOtp) throw new UnauthorizedException("Incorrect OTP entered");

      await this.userModel.update({ otp: null, isVerified: true, }, {
        where: {
          userId
        }
      });

      const token = this.jwtService.sign({ email, userId });

      return responseBody(201, "OTP verification completed", "User has been verified", token);
    } catch (err) {
      return err;
    }
  }

  async signupWithEmailName(reqBody: CreateWithEmailName) {
    const { email, name } = reqBody;
    try {
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }
      const userId = existingUser.get({ plain: true }).userId;

      const existUserProfile = await this.userProfileModel.findOne({ where: { userId } });

      if (existUserProfile) {
        throw new MethodNotAllowedException(message.DATA_ALREADY_ADDED);
      }

      const userProfileData = this.userProfileModel.create({
        userId: existingUser.get({ plain: true }).userId,
        fullName: name
      });

      return responseBody(201, message.NAME_UPDATED_SUCCESSFULLY, (await userProfileData).get({ plain: true }));
    } catch (err) {

    }
  }

  async signupWithEmailDob(reqBody: CreateWithEmailDob) {
    const { dob, email } = reqBody;
    try {
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      const userId = existingUser.get({ plain: true }).userId;

      const existUserProfile = await this.userProfileModel.findOne({ where: { userId } });

      const dateOfBirth = existUserProfile?.get({ plain: true }).dateOfBirth;

      if (existUserProfile && dateOfBirth !== null) {
        throw new MethodNotAllowedException(message.DATA_ALREADY_ADDED);
      }

      const userProfile = await this.userProfileModel.update({ dateOfBirth: dob }, {
        where: {
          userId
        }
      });

      return responseBody(201, message.DATA_ALREADY_ADDED, userProfile);
    } catch (err) {

    }
  }

  async findAll() {
    try {
      const allUsers = await this.userModel.findAll({
        attributes: { exclude: ['password'] }
      });

      return {
        message: 'All users fetched',
        data: allUsers,
      };

    } catch (err) {
      throw new BadRequestException('Internal server error');
    }
  }

  async findOneById(id: string) {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'The user found',
      data: user,
    };
  }

  async updateUserById(id: string, updateAuthDto: UpdateAuthDto) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.update(updateAuthDto);

    const { password, ...userWithoutPassword } = user.get({ plain: true });

    return userWithoutPassword;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
