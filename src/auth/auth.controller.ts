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
  Req,
  MethodNotAllowedException
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(AuthGuard)
  @Post("/validate-token")
  async validateToken(@Req() req: Request, @Res() res: Response) {
    console.log("reached validating");

    const response = await this.authService.validateToken(req);
    if (response instanceof UnauthorizedException) {
      res.status(403);
    } else {
      res.status(201);
    }

    return res.send(response);
  }

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
  async createWithEmailVerify(@Body() reqBody: CreateWithEmailVerify, @Res() res: Response, @Req() req: Request) {
    const response = await this.authService.signupWithEmailVerify(reqBody, req);
    if (response instanceof BadRequestException) {
      res.status(400);
    }

    if (response instanceof UnauthorizedException) {
      res.status(403);
    }

    return res.send(response);
  }

  @UseGuards(AuthGuard)
  @Post('/signup-with-email-name')
  async createWithEmailName(@Body() reqBody: any, @Req() req: Request, @Res() res: Response) {
    const response = await this.authService.signupWithEmailName(reqBody, req);
    if (response instanceof BadRequestException) {
      res.status(400);
    }

    if (response instanceof MethodNotAllowedException) {
      res.status(405);
    }

    return res.send(response);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-date-of-birth')
  async createWithEmailDob(@Body() reqBody: CreateWithEmailDob, @Req() req: Request, @Res() res: Response) {
    const response = await this.authService.signupWithEmailDob(reqBody, req);

    if (response instanceof BadRequestException) {
      res.status(400);
    }

    if (response instanceof MethodNotAllowedException) {
      res.status(405);
    }

    if (response instanceof UnauthorizedException) {
      res.status(403);
      res['message'] = response.message;
    }

    return res.send(response);
  }

  @UseGuards(AuthGuard)
  @Put('/signup-with-email-gender')
  async createWithEmailGender(@Body() reqBody: CreateWithEmailGender, @Req() req: Request, @Res() res: Response) {
    const response = await this.authService.signupWithEmailGender(reqBody, req);

    if (response instanceof BadRequestException) {
      res.status(400);
    }

    if (response instanceof MethodNotAllowedException) {
      res.status(405);
    }

    if (response instanceof UnauthorizedException) {
      res.status(403);
      res['message'] = response.message;
    }

    return res.send(response);
  }
  @UseGuards(AuthGuard)
  @Put('/signup-with-email-interest')
  async createWithEmailInterest(@Body() reqBody: CreateWithEmailLookingFor, @Req() req: Request, @Res() res: Response) {
    const response = await this.authService.signupWithEmailInterest(reqBody, req);

    if (response instanceof BadRequestException) {
      res.status(400);
    }

    if (response instanceof MethodNotAllowedException) {
      res.status(405);
    }

    if (response instanceof UnauthorizedException) {
      res.status(403);
      res['message'] = response.message;
    }

    return res.send(response);
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
