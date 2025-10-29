import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Put
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SwipeDto } from './dto/swipe.dto';
import { AddInterestsDto } from './dto/add.interests.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @UseGuards(AuthGuard)
  @Post('/get-profiles')
  async getMatchedProfiles(@Req() request: Request) {
    return await this.profileService.getMatchedProfiles(request);
  }

  @UseGuards(AuthGuard)
  @Post('/swipe')
  async swipe(@Body() swipeDto: SwipeDto, @Req() request: Request) {
    return this.profileService.swipe(swipeDto, request);
  }

  @Get('/get-all-interests')
  async getAllInterests() {
    return await this.profileService.getAllInterests();
  }

  @UseGuards(AuthGuard)
  @Put('/add-interests')
  async addInterests(@Body() addInterestsDto: AddInterestsDto, @Req() request: Request) {
    const { userId } = request['user'];
    return await this.profileService.addInterests(addInterestsDto, userId);
  }

  @UseGuards(AuthGuard)
  @Post('/get-all-swiped-profiles')
  async getAllSwipedProfiles(@Req() request: Request) {
    const { userId } = request['user'];
    return await this.profileService.getAllSwipedProfiles(userId);
  }

  @Get(':userId')
  async findUser(@Param('userId') userId: string) {
    return await this.profileService.findUser(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(+id, updateProfileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
