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
  BadRequestException,
  UnauthorizedException,
  Req
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateWithEmailVerify } from './dto/create.with.email.verify';
import { CreateWithEmailDob } from './dto/create.with.email.dob';
// import { AuthGuard } from './auth.guard';
import type { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('/signup-with-email')
  async createWithEmail(@Body() reqBody: any, @Res() res: Response) {
    const response = await this.authService.signupWithEmail(reqBody, res);
    if (response instanceof BadRequestException) {
      res.status(400);
    }
    return res.send(response);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-password')
  createWithEmailPassword(@Body() reqBody: any, @Req() req: Request) {
    return this.authService.signupWithEmailPassword(reqBody, req);
  }

  @Post('/signup-with-email-verify')
  async createWithEmailVerify(@Body() reqBody: CreateWithEmailVerify, @Res() res: Response) {
    const response = await this.authService.signupWithEmailVerify(reqBody, res);
    if (response instanceof BadRequestException) {
      res.status(400);
    }

    if (response instanceof UnauthorizedException) {
      res.status(403);
    }

    return res.send(response);
  }

  @Post('/signup-with-email-name')
  createWithEmailName(@Body() reqBody: any) {
    return this.authService.signupWithEmailName(reqBody);
  }

  @Put('/signup-with-email-date-of-birth')
  createWithEmailDob(@Body() reqBody: CreateWithEmailDob) {
    return this.authService.signupWithEmailDob(reqBody);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOneById(id);
  }

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updateUserById(id, updateAuthDto);
  }

  @Delete(':id')
  removeById(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
