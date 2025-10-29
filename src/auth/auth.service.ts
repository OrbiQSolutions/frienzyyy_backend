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
import { CreateWithEmailGender } from './dto/create.with.email.gender.dto';
import { CreateWithEmailLookingFor } from './dto/create.with.email.lookingfor.dto';
import { AuthLog } from './entities/auth.log.entity';
import { LoginDto } from './dto/login.dto';
import { LoginPasswordDto } from './dto/login.password.dto';
import { BioDto } from './dto/bio.sto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,

    @InjectModel(User)
    private readonly userModel: typeof User,

    @InjectModel(UserProfile)
    private readonly userProfileModel: typeof UserProfile,

    @InjectModel(AuthLog)
    private readonly authLogModel: typeof AuthLog,

    @InjectQueue("emails")
    private readonly emailQueue: Queue,
  ) { }

  private async getToken(email: string, userId: string, deviceName?: string): Promise<string> {
    const token = this.jwtService.sign({ email, userId });
    const createdAt = Date.now();
    const log = await this.authLogModel.create({
      userId,
      token,
      deviceOS: deviceName,
      createdAt
    });
    if (!log) {
      this.logger.log("The log has been registered")
    } else {
      this.logger.warn("The loggin was failed")
    }
    return token;
  }

  private generateFourDigitRandomNumber(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  async validateToken(request: Request) {
    const { userId } = request['user'];
    const [type, token] = String(request.headers[String(process.env.TOKEN_KEY)]).split(' ');
    try {

      const prevLog = await this.authLogModel.findOne({
        where: {
          userId: String(userId),
          token: token
        }
      });

      if (!prevLog) {
        throw new UnauthorizedException("The token is invalid or expired");
      }

      return responseBody(201, "The user is authenticated");
    } catch (err) {
      this.logger.error(err);
      return err;
    }
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
      return err;
    }
  }

  async signupWithEmailVerify(reqBody: CreateWithEmailVerify, request: Request) {
    const { email, otp } = reqBody;
    const { DeviceOS } = request.headers;
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
      console.log("Deivce name:", DeviceOS);
      const token = await this.getToken(email, userId, String(DeviceOS));

      return responseBody(201, "OTP verification completed", "User has been verified", token);
    } catch (err) {
      return err;
    }
  }

  async signupWithEmailName(reqBody: CreateWithEmailName, request: Request) {
    const { userId } = request['user'];
    const { name } = reqBody;
    try {
      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: {
          exclude: ['password', 'otp']
        },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      if (existingUser && existingUser?.get({ plain: true }).profile !== null) {
        throw new MethodNotAllowedException(message.DATA_ALREADY_ADDED);
      }

      const userProfileData = this.userProfileModel.create({
        userId,
        fullName: name
      });

      return responseBody(201, message.NAME_UPDATED_SUCCESSFULLY, (await userProfileData).get({ plain: true }));
    } catch (err) {
      return err;
    }
  }

  async signupWithEmailDob(reqBody: CreateWithEmailDob, request: Request) {
    const { userId } = request['user'];
    const { dob } = reqBody;
    try {
      const newDob = new Date(dob);

      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: {
          exclude: ['password', 'otp']
        },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (isNaN(newDob.getTime()) || !existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      const dateOfBirth = existingUser?.get({ plain: true }).dateOfBirth;
      console.log(existingUser?.get({ plain: true }));
      if (existingUser && dateOfBirth) {
        throw new MethodNotAllowedException(message.DATA_ALREADY_ADDED);
      }
      console.log(dob);
      const userProfile = await this.userProfileModel.update({ dateOfBirth: newDob }, {
        where: {
          userId
        }
      });

      return responseBody(201, message.DATA_ALREADY_ADDED, userProfile);
    } catch (err) {
      return err;
    }
  }

  async signupWithEmailGender(reqBody: CreateWithEmailGender, request: Request) {
    const { userId } = request['user'];
    const { gender } = reqBody;
    try {

      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: {
          exclude: ['password', 'otp']
        },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      const userProfile = await this.userProfileModel.update({ gender }, {
        where: {
          userId
        }
      });

      return responseBody(201, message.DATA_ALREADY_ADDED, userProfile);
    } catch (err) {
      return err;
    }
  }


  async signupWithEmailInterest(reqBody: CreateWithEmailLookingFor, request: Request) {
    const { userId } = request['user'];
    const { lookingFor } = reqBody;
    try {

      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: {
          exclude: ['password', 'otp']
        },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      const userProfile = await this.userProfileModel.update({ interest: lookingFor }, {
        where: {
          userId
        }
      });

      return responseBody(201, message.DATA_ALREADY_ADDED, userProfile);
    } catch (err) {
      return err;
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

  async loginUser(loginDto: LoginDto) {
    const { email } = loginDto;
    try {
      const existingUser = await this.userModel.findOne({
        where: {
          email
        }
      });

      if (!existingUser) {
        throw new NotFoundException("The user doesn't exist");
      }

      return responseBody(201, "The user is successfully found");

    } catch (err) {
      return err;
    }
  }

  async loginUserPassword(loginPassDto: LoginPasswordDto, request: Request) {
    const { email, password } = loginPassDto;
    const { DeviceOS } = request.headers;
    try {
      console.log(password);
      console.log(email);
      const existingUser = await this.userModel.findOne({
        where: {
          email,
          password
        },
        attributes: {
          exclude: ['password']
        }
      });

      if (!existingUser) {
        throw new UnauthorizedException("The combiantion of credentials are not valid");
      }

      const userId = existingUser.get({ plain: true }).userId;

      const token = await this.getToken(email, userId, String(DeviceOS))
      return responseBody(201, "The user is successfully found", existingUser, token);

    } catch (err) {
      return err;
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

  async updateBioWhileOnboard(bioDto: BioDto, request: Request) {
    const { userId } = request["user"];
    const { bio } = bioDto;
    try {
      const existingUser = await this.userModel.findOne({ where: { userId } });

      if (!existingUser) {
        throw new BadRequestException(message.USER_DOESNT_EXIST);
      }

      const bioUpdated = await this.userProfileModel.update({
        bio
      }, {
        where: {
          userId
        }
      });

      return responseBody(201, "Updated Successfully", bioUpdated);
    } catch (err) {

    }
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      return responseBody(404, 'User not found', null);
    }
    await user.destroy();
    return responseBody(200, 'User deleted successfully', user);
  }
}
