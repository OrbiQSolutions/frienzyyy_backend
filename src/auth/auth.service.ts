import { BadRequestException, ForbiddenException, Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import response from 'src/core/commonfunctions/response.body';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    // await this.jwtService.signAsync(payload)
    @InjectModel(User)
    private userModel: typeof User,
  ) { }

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

  async signupWithEmail(reqBody: any) {
    try {
      const { email } = reqBody;

      const existingUser = await this.userModel.findOne({ where: { email } });

      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      const newUser = await this.userModel.create({
        email
      });

      // todo: sent email to the user email using redis and nodemailer

      const { password: _, ...userWithoutPass } = newUser.get({ plain: true });

      return {
        message: 'User registered successfully',
        data: userWithoutPass
      };

    } catch (exc) {
      // console.log(`exception: ${exc}`);
    }
  }

  async signupWithEmailPassword(reqBody: any) {
    const { password, email } = reqBody;

    try {
      const existingUser = await this.userModel.findOne({ where: { email } });

      if (!existingUser) {
        throw new BadRequestException("The user does not exist");
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
        return response(200, "Successfully updated");
      else {

      }
    } catch (err) {

    }
  }
  async signupWithEmailVerify(reqBody: any) {
    const { email, otp } = reqBody;
    try {

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
