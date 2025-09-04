import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

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
