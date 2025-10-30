import {
  Controller,
  Post,
  Body,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseInterceptors,
  UseGuards,
  Req,
  HttpCode
} from '@nestjs/common';
import { UserService } from './user.service';
import { ProfilePictureDto } from './dto/profile.picture.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('/upload-profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadProfilePicture(
    @Body() body: ProfilePictureDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png)$/ })
        .addMaxSizeValidator({ maxSize: 5242880, message: 'File too large (max 5MB)' })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
    ) file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return this.userService.uploadProfilePicture(body, file, request['user'].userId);
  }
}
