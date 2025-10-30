import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Res,
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateWithEmailVerify } from './dto/create.with.email.verify';
import { CreateWithEmailDob } from './dto/create.with.email.dob';
import type { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { CreateWithEmailGender } from './dto/create.with.email.gender.dto';
import { CreateWithEmailLookingFor } from './dto/create.with.email.lookingfor.dto';
import { LoginDto } from './dto/login.dto';
import { LoginPasswordDto } from './dto/login.password.dto';
import { BioDto } from './dto/bio.sto';
import { PasswordDto } from './dto/password.dto';
import { CreateWithEmailNameDto } from './dto/create.with.email.name';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard)
  @Post('/validate-token')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.validateToken(req);
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('/signup-with-email')
  @HttpCode(HttpStatus.CREATED)
  async createWithEmail(@Body() reqBody: any) {
    return this.authService.signupWithEmail(reqBody);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-password')
  @HttpCode(HttpStatus.OK)
  async createWithEmailPassword(@Body() reqBody: PasswordDto, @Req() req: Request) {
    return this.authService.signupWithEmailPassword(reqBody, req);
  }

  @Post('/signup-with-email-verify')
  @HttpCode(HttpStatus.CREATED)
  async createWithEmailVerify(@Body() reqBody: CreateWithEmailVerify, @Req() req: Request) {
    return this.authService.signupWithEmailVerify(reqBody, req);
  }

  @UseGuards(AuthGuard)
  @Post('/signup-with-email-name')
  @HttpCode(HttpStatus.CREATED)
  async createWithEmailName(@Body() reqBody: CreateWithEmailNameDto, @Req() req: Request) {
    return this.authService.signupWithEmailName(reqBody, req);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-date-of-birth')
  @HttpCode(HttpStatus.OK)
  async createWithEmailDob(@Body() reqBody: CreateWithEmailDob, @Req() req: Request) {
    return this.authService.signupWithEmailDob(reqBody, req);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-gender')
  @HttpCode(HttpStatus.OK)
  async createWithEmailGender(@Body() reqBody: CreateWithEmailGender, @Req() req: Request) {
    return this.authService.signupWithEmailGender(reqBody, req);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-interest')
  @HttpCode(HttpStatus.OK)
  async createWithEmailInterest(@Body() reqBody: CreateWithEmailLookingFor, @Req() req: Request) {
    return this.authService.signupWithEmailInterest(reqBody, req);
  }

  @Post('/login-user')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @Post('/login-user-password')
  @HttpCode(HttpStatus.OK)
  async loginUserPassword(@Body() loginPasswordDto: LoginPasswordDto, @Req() request: Request) {
    return this.authService.loginUserPassword(loginPasswordDto, request);
  }

  @UseGuards(AuthGuard)
  @Put('/update-bio')
  @HttpCode(HttpStatus.OK)
  async updateBioWhileOnboard(@Body() bioDto: BioDto, @Req() request: Request) {
    return this.authService.updateBioWhileOnboard(bioDto, request);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.authService.findOneById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  updateById(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updateUserById(id, updateAuthDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
