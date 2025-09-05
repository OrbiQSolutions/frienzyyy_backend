import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CreateWithEmailVerify } from './dto/create.with.email.verify';
import { CreateWithEmailDob } from './dto/create.with.email.dob';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('/signup-with-email')
  createWithEmail(@Body() reqBody: any) {
    return this.authService.signupWithEmail(reqBody);
  }

  @Put('/signup-with-email-password')
  createWithEmailPassword(@Body() reqBody: any) {
    return this.authService.signupWithEmailPassword(reqBody);
  }

  @Post('/signup-with-email-verify')
  createWithEmailVerify(@Body() reqBody: CreateWithEmailVerify) {
    return this.authService.signupWithEmailVerify(reqBody);
  }

  @Post('/signup-with-email-name')
  createWithEmailName(@Body() reqBody: any) {
    return this.authService.signupWithEmailName(reqBody);
  }

  @Post('/signup-with-email-date-of-birth')
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
