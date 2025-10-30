import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  Req,
  HttpCode
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfilePictureDto } from './dto/profile.picture.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('/upload-profile-picture')
  @UseInterceptors(FileInterceptor('file')) // FIXED: Single file upload
  @HttpCode(HttpStatus.CREATED)
  async uploadProfilePicture(
    @Body() body: ProfilePictureDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }) // FIXED: Regex for image types
        .addMaxSizeValidator({ maxSize: 5242880, message: 'File too large (max 5MB)' }) // FIXED: 5MB limit
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
    ) file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return this.userService.uploadProfilePicture(body, file, request['user'].userId);
  }
}
