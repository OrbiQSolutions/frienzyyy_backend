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
  Put,
  HttpCode,
  HttpStatus,
  ForbiddenException
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
  @Get('/get-profiles')
  @HttpCode(HttpStatus.OK)
  async getMatchedProfiles(@Req() request: Request) {
    return this.profileService.getMatchedProfiles(request['user'].userId);
  }

  @UseGuards(AuthGuard)
  @Post('/swipe')
  @HttpCode(HttpStatus.CREATED)
  async swipe(@Body() swipeDto: SwipeDto, @Req() request: Request) {
    return this.profileService.swipe(swipeDto, request['user'].userId);
  }

  @Get('/get-all-interests')
  @HttpCode(HttpStatus.OK)
  async getAllInterests() {
    return this.profileService.getAllInterests();
  }

  @UseGuards(AuthGuard)
  @Put('/add-interests')
  @HttpCode(HttpStatus.OK)
  async addInterests(@Body() addInterestsDto: AddInterestsDto, @Req() request: Request) {
    return this.profileService.addInterests(addInterestsDto, request['user'].userId);
  }

  @UseGuards(AuthGuard)
  @Post('/get-all-swiped-profiles')
  @HttpCode(HttpStatus.OK)
  async getAllSwipedProfiles(@Req() request: Request) {
    return this.profileService.getAllSwipedProfiles(request['user'].userId);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  async findUser(@Param('userId') userId: string) {
    return this.profileService.findUser(userId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto, @Req() req: Request) {
    if (req['user'].userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.profileService.update(id, updateProfileDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: Request) {
    if (req['user'].userId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.profileService.remove(id);
  }
}
