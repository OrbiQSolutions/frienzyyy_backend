import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UserProfile } from './entities/user.profile.entity';
import { CreateWithEmailVerify } from './dto/create.with.email.verify';
import { CreateWithEmailNameDto } from './dto/create.with.email.name';
import { CreateWithEmailDob } from './dto/create.with.email.dob';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Request } from 'express';
import { CreateWithEmailGender } from './dto/create.with.email.gender.dto';
import { CreateWithEmailLookingFor } from './dto/create.with.email.lookingfor.dto';
import { AuthLog } from './entities/auth.log.entity';
import { LoginDto } from './dto/login.dto';
import { LoginPasswordDto } from './dto/login.password.dto';
import { BioDto } from './dto/bio.sto';
import * as bcrypt from 'bcrypt';
import { PasswordDto } from './dto/password.dto';
import { responseBody } from '../core/commonfunctions/response.body';
import { message } from '../core/constants/message.constants';

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
    try {
      const token = this.jwtService.sign({ email, userId });
      const createdAt = Date.now();
      await this.authLogModel.create({
        userId,
        token,
        deviceOS: deviceName,
        createdAt
      });
      this.logger.log(`Token generated for user ${userId}`);
      return token;
    } catch (err) {
      this.logger.error(`Token generation failed: ${err}`);
      throw new BadRequestException('Token generation failed');
    }
  }

  private generateFourDigitRandomNumber(): number {
    return Math.floor(Math.random() * 9000) + 1000;
  }

  async validateToken(request: Request) {
    const { userId } = request['user'];
    const [type, token] = String(request.headers[String(process.env.TOKEN_KEY)]).split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    const prevLog = await this.authLogModel.findOne({
      where: {
        userId: String(userId),
        token: token
      }
    });

    if (!prevLog) {
      throw new UnauthorizedException('Token invalid or expired');
    }

    try {
      return responseBody(201, "The user is authenticated");
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async signup(createAuthDto: CreateAuthDto) {
    try {
      const { email, password, firstName, lastName } = createAuthDto;

      const existingUser = await this.userModel.findOne({ where: { email } });
      if (existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.EMAIL_EXISTS);
      }

      const hashedPassword = await bcrypt.hash(password, String(process.env.BCRYPT_SALT));
      const newUser = await this.userModel.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      const { password: _, ...userWithoutPass } = newUser.get({ plain: true });
      return responseBody(HttpStatus.CREATED, message.REGISTRATION_SUCCESS, userWithoutPass);
    } catch (err) {
      this.logger.error(`Signup failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async signupWithEmail(reqBody: any) {
    try {
      const { email } = reqBody;

      const existingUser = await this.userModel.findOne({ where: { email } });
      if (existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.EMAIL_EXISTS);
      }

      this.logger.log(`No user found with email: ${email}, creating new user.`);

      const otp = this.generateFourDigitRandomNumber();

      const newUser = await this.userModel.create({
        email,
        otp,
      });

      this.logger.log(`User created with email: ${email}. Sending verification email.`);

      await this.emailQueue.add('signup-email', {
        to: email,
        subject: 'Frienzyyy - Email Verification',
        text: `Your OTP for email verification is ${otp}`,
        html: `<p>Your OTP for email verification is <strong>${otp}</strong></p>`,
      });

      const { password, otp: _, ...userWithoutPass } = newUser.get({ plain: true });

      this.logger.log(`Verification email sent to ${email}.`);

      return responseBody(HttpStatus.CREATED, 'User registered successfully', userWithoutPass);
    } catch (err) {
      this.logger.error(`Signup with email failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async signupWithEmailPassword(reqBody: PasswordDto, request: Request) {
    try {
      const { email } = request['user'];
      const { password } = reqBody;

      this.logger.log(`Setting password for user with email: ${email}`);

      const existingUser = await this.userModel.findOne({ where: { email } });

      if (!existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      if (existingUser.password !== null) {
        return responseBody(HttpStatus.METHOD_NOT_ALLOWED, 'Password already set');
      }

      const hashedPassword = await bcrypt.hash(password, String(process.env.BCRYPT_SALT));
      const [updatedCount] = await this.userModel.update(
        { password: hashedPassword },
        { where: { email } }
      );

      if (updatedCount === 1) {
        return responseBody(HttpStatus.OK, 'Password updated successfully');
      } else {
        return responseBody(HttpStatus.BAD_REQUEST, 'Failed to update password');
      }
    } catch (err) {
      this.logger.error(`Password set failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async signupWithEmailVerify(reqBody: CreateWithEmailVerify, request: Request) {
    try {
      const { email, otp } = reqBody;
      const { DeviceOS } = request.headers;
      const user = await this.userModel.findOne({ where: { email } });

      if (!user) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      const userOtp = user.get({ plain: true }).otp;
      const userId = user.get({ plain: true }).userId;
      if (otp !== userOtp) {
        return responseBody(HttpStatus.UNAUTHORIZED, 'Incorrect OTP');
      }

      await this.userModel.update({ otp: null, isVerified: true }, { where: { userId } });
      const token = await this.getToken(email, userId, String(DeviceOS));

      return responseBody(HttpStatus.CREATED, 'OTP verification completed', null, token);
    } catch (err) {
      this.logger.error(`OTP verification failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.OTP_INVALID);
    }
  }

  async signupWithEmailName(reqBody: CreateWithEmailNameDto, request: Request) {
    try {
      const { userId } = request['user'];
      const { name } = reqBody;
      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: { exclude: ['password', 'otp'] },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (!existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      if (existingUser.get({ plain: true }).profile !== null) {
        return responseBody(HttpStatus.METHOD_NOT_ALLOWED, message.DATA_ALREADY_ADDED);
      }

      const userProfileData = await this.userProfileModel.create({
        userId,
        fullName: name
      });

      return responseBody(HttpStatus.CREATED, message.NAME_UPDATED_SUCCESSFULLY, userProfileData.get({ plain: true }));
    } catch (err) {
      this.logger.error(`Name update failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async signupWithEmailDob(reqBody: CreateWithEmailDob, request: Request) {
    try {
      const { userId } = request['user'];
      const { dob } = reqBody;
      const newDob = new Date(dob);

      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: { exclude: ['password', 'otp'] },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (isNaN(newDob.getTime()) || !existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      const dateOfBirth = existingUser.get({ plain: true }).profile?.dateOfBirth;
      if (dateOfBirth) {
        return responseBody(HttpStatus.METHOD_NOT_ALLOWED, message.DATA_ALREADY_ADDED);
      }

      const [updatedCount] = await this.userProfileModel.update(
        { dateOfBirth: newDob },
        { where: { userId } }
      );

      if (updatedCount === 1) {
        return responseBody(HttpStatus.OK, 'DOB updated successfully');
      }
      return responseBody(HttpStatus.BAD_REQUEST, 'Failed to update DOB');
    } catch (err) {
      this.logger.error(`DOB update failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async signupWithEmailGender(reqBody: CreateWithEmailGender, request: Request) {
    try {
      const { userId } = request['user'];
      const { gender } = reqBody;
      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: { exclude: ['password', 'otp'] },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (!existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      const [updatedCount] = await this.userProfileModel.update(
        { gender },
        { where: { userId } }
      );

      if (updatedCount === 1) {
        return responseBody(HttpStatus.OK, 'Gender updated successfully');
      }
      return responseBody(HttpStatus.BAD_REQUEST, 'Failed to update gender');
    } catch (err) {
      this.logger.error(`Gender update failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async signupWithEmailInterest(reqBody: CreateWithEmailLookingFor, request: Request) {
    try {
      const { userId } = request['user'];
      const { lookingFor } = reqBody;
      const existingUser = await this.userModel.findOne({
        where: { userId },
        attributes: { exclude: ['password', 'otp'] },
        include: [{ model: UserProfile, as: 'profile', required: false }]
      });

      if (!existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      const [updatedCount] = await this.userProfileModel.update(
        { interest: lookingFor },
        { where: { userId } }
      );

      if (updatedCount === 1) {
        return responseBody(HttpStatus.OK, 'Interest updated successfully');
      }
      return responseBody(HttpStatus.BAD_REQUEST, 'Failed to update interest');
    } catch (err) {
      this.logger.error(`Interest update failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    try {
      const allUsers = await this.userModel.findAll({
        attributes: { exclude: ['password', 'otp'] },
        include: ['profile', 'profilePicture', 'interests'], // FIXED: Include relations
      });

      return responseBody(HttpStatus.OK, 'All users fetched', allUsers);
    } catch (err) {
      this.logger.error(`Find all users failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async loginUser(loginDto: LoginDto) {
    try {
      const { email } = loginDto;
      const existingUser = await this.userModel.findOne({
        where: { email }
      });

      if (!existingUser) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }

      return responseBody(HttpStatus.OK, 'User found successfully');
    } catch (err) {
      this.logger.error(`Login user failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async loginUserPassword(loginPasswordDto: LoginPasswordDto, request: Request) {
    try {
      const { email, password } = loginPasswordDto;
      const { DeviceOS } = request.headers;
      const existingUser = await this.userModel.findOne({
        where: { email },
        attributes: { exclude: ['otp'] }
      });

      if (!existingUser) {
        return responseBody(HttpStatus.UNAUTHORIZED, message.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await bcrypt.compare(password, existingUser.password);
      if (!isPasswordValid) {
        return responseBody(HttpStatus.UNAUTHORIZED, message.INVALID_CREDENTIALS);
      }

      const userId = existingUser.get({ plain: true }).userId;
      const token = await this.getToken(email, userId, String(DeviceOS));
      const { password: _, ...userWithoutPassword } = existingUser.get({ plain: true });

      return responseBody(HttpStatus.OK, message.LOGIN_SUCCESS, userWithoutPassword, token);
    } catch (err) {
      this.logger.error(`Login password failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async findOneById(id: string) {
    try {
      const user = await this.userModel.findByPk(id, {
        attributes: { exclude: ['password', 'otp'] },
        include: ['profile', 'profilePicture', 'interests'],
      });

      if (!user) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }

      return responseBody(HttpStatus.OK, 'User found', user);
    } catch (err) {
      this.logger.error(`Find user by ID failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUserById(id: string, updateAuthDto: UpdateAuthDto) {
    try {
      const user = await this.userModel.findByPk(id);

      if (!user) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }

      await user.update(updateAuthDto);

      const { password, otp, ...userWithoutSensitive } = user.get({ plain: true });
      return responseBody(HttpStatus.OK, 'User updated successfully', userWithoutSensitive);
    } catch (err) {
      this.logger.error(`Update user failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, err.message || message.INTERNAL_SERVER_ERROR);
    }
  }

  async updateBioWhileOnboard(bioDto: BioDto, request: Request) {
    try {
      const { userId } = request['user'];
      const { bio } = bioDto;
      const existingUser = await this.userModel.findOne({ where: { userId } });

      if (!existingUser) {
        return responseBody(HttpStatus.BAD_REQUEST, message.USER_DOESNT_EXIST);
      }

      const [updatedCount] = await this.userProfileModel.update(
        { bio },
        { where: { userId } }
      );

      if (updatedCount === 1) {
        return responseBody(HttpStatus.OK, message.PROFILE_UPDATED);
      }
      return responseBody(HttpStatus.BAD_REQUEST, 'Failed to update bio');
    } catch (err) {
      this.logger.error(`Bio update failed: ${err}`);
      return responseBody(HttpStatus.BAD_REQUEST, message.INTERNAL_SERVER_ERROR);
    }
  }
  async deleteUser(id: string) {
    try {
      const user = await this.userModel.findByPk(id);
      if (!user) {
        return responseBody(HttpStatus.NOT_FOUND, message.USER_DOESNT_EXIST);
      }
      await user.destroy();
      return responseBody(HttpStatus.OK, message.DELETED_SUCCESS);
    } catch (err) {
      this.logger.error(`Delete user failed: ${err}`);
      return responseBody(HttpStatus.INTERNAL_SERVER_ERROR, message.INTERNAL_SERVER_ERROR);
    }
  }
}
